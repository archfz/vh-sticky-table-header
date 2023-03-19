/**
 * This class is used for both table sticky header and horizontal scroll support on tables.
 */
export default class StickyTableHeader {
  private sizeListener?: EventListener;
  private scrollListener?: EventListener;
  private currentFrameRequest?: number;
  private containerScrollListener?: EventListener;
  private clickListener?: (event: MouseEvent) => any;
  private tableContainerParent: HTMLDivElement;
  private tableContainer: HTMLTableElement;
  private cloneContainer: HTMLTableElement;
  private cloneContainerParent: HTMLDivElement;
  private cloneHeader: any = null;
  private header: HTMLTableRowElement;
  private top: { max: number | string; [key: number]: number | string };

  constructor(
    tableContainer: HTMLTableElement,
    cloneContainer: HTMLTableElement,
    top: { max: number | string; [key: number]: number | string },
  ) {
    const header = tableContainer.querySelector<HTMLTableRowElement>('thead');
    this.tableContainer = tableContainer;
    this.cloneContainer = cloneContainer;
    this.top = top;

    if (!header || !this.tableContainer.parentNode) {
      throw new Error('Header or parent node of sticky header table container not found!');
    }

    this.tableContainerParent = this.tableContainer.parentNode as HTMLDivElement;
    this.cloneContainerParent = this.cloneContainer.parentNode as HTMLDivElement;
    this.header = header;

    this.setup();
  }

  public destroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    if (this.currentFrameRequest) {
      window.cancelAnimationFrame(this.currentFrameRequest);
    }
    if (this.sizeListener) {
      window.removeEventListener('resize', this.sizeListener);
    }
    if (this.containerScrollListener) {
      this.tableContainerParent.removeEventListener('click', this.containerScrollListener);
    }
    if (this.clickListener) {
      this.cloneContainer.removeEventListener('click', this.clickListener);
    }
    if (this.cloneHeader) {
      this.cloneContainer.removeChild(this.cloneHeader);
    }
  }

  private setupClickEventMirroring(): void {
    this.clickListener = (event: MouseEvent) => {
      let containerRect = this.tableContainer.getBoundingClientRect();
      let cloneRect = this.cloneContainer.getBoundingClientRect();
      const bodyRect = document.body.getBoundingClientRect();
      window.scrollTo({ top: containerRect.y - bodyRect.y - this.getTop() - 60 });

      setTimeout(() => {
        containerRect = this.tableContainer.getBoundingClientRect();
        const originalTarget = document.elementFromPoint(
          containerRect.x + (event.clientX - cloneRect.x),
          containerRect.y + (event.clientY - cloneRect.y),
        );
        if (originalTarget && (originalTarget as HTMLElement).click) {
          (originalTarget as HTMLElement).click();
        }
      }, 50);
    };
    this.cloneContainer.addEventListener('click', this.clickListener);
  }

  private setupSticky(): void {
    const updateSticky = () => {
      this.currentFrameRequest = window.requestAnimationFrame(() => {
        const lastElement = this.tableContainer.querySelector('tbody tr:last-child');
        const bodyRectY = document.body.getBoundingClientRect().y;
        const tableRect = this.tableContainer.getBoundingClientRect();
        const tableOffsetTop = this.tableContainer.offsetTop;
        const tableTop = tableRect.y - bodyRectY;
        let tableBottom;

        if (lastElement) {
          tableBottom = lastElement.getBoundingClientRect().y
            - bodyRectY
            - this.header.getBoundingClientRect().height;
        } else {
          tableBottom = tableRect.y + tableRect.height
            - bodyRectY
            - this.header.getBoundingClientRect().height;
        }

        const diffTop = window.scrollY - tableTop;
        const diffBottom = window.scrollY - tableBottom;
        const topPx = this.getTop();

        if (diffTop > -topPx && null === this.cloneHeader) {
          this.cloneContainerParent.style.display = 'none';
          this.cloneHeader = this.createClone();
        }

        if (null !== this.cloneHeader) {
          if (diffTop <= -topPx) {
            this.cloneContainerParent.style.display = 'none';
            this.cloneContainer.removeChild(this.cloneHeader);
            this.cloneHeader = null;
          } else if (diffBottom < -topPx) {
            this.cloneContainerParent.style.display = 'block';
            this.cloneContainerParent.style.position = 'fixed';
            this.cloneContainerParent.style.top = `${topPx}px`;
            this.setHorizontalScrollOnClone();
          } else {
            this.cloneContainerParent.style.display = 'block';
            this.cloneContainerParent.style.position = 'absolute';
            this.cloneContainerParent.style.top = `${tableBottom - tableTop + tableOffsetTop}px`;
          }
        }
      });
    };
    this.scrollListener = () => updateSticky();
    window.addEventListener('scroll', this.scrollListener);
    updateSticky();
  }

  private setup(): void {
    this.setupSticky();
    this.setupSizeMirroring();
    this.setupClickEventMirroring();
    this.setupHorizontalScrollMirroring();
  }

  private setupSizeMirroring(): void {
    this.sizeListener = () => {
      window.requestAnimationFrame(() => {
        const headerSize = this.header.getBoundingClientRect().width;
        this.cloneContainer.style.width = `${headerSize}px`;
        this.cloneContainerParent.style.top = `${this.getTop()}px`;
        this.setHorizontalScrollOnClone();
      });
    };
    window.addEventListener('resize', this.sizeListener);
  }

  private setupHorizontalScrollMirroring(): void {
    this.containerScrollListener = () => {
      window.requestAnimationFrame(() => {
        this.setHorizontalScrollOnClone();
      });
    };
    this.tableContainerParent.addEventListener('scroll', this.containerScrollListener);
  }

  private createClone(): HTMLTableRowElement {
    const clone = this.header.cloneNode(true) as HTMLTableRowElement;
    this.cloneContainer.append(clone);

    const headerSize = this.header.getBoundingClientRect().width;
    Array.from(this.header.children[0].children).forEach((cell, index) => {
      (clone.children[0].children[index] as HTMLTableCellElement).style.width =
        (cell.getBoundingClientRect().width / headerSize) * 100 + '%';
    });

    this.cloneContainer.style.display = 'table';
    this.cloneContainer.style.width = `${headerSize}px`;

    this.cloneContainerParent.style.position = 'fixed';
    this.cloneContainerParent.style.overflow = 'hidden';
    this.cloneContainerParent.style.top = `${this.getTop()}px`;

    this.setHorizontalScrollOnClone();

    return clone;
  }

  private setHorizontalScrollOnClone(): void {
    this.cloneContainerParent.style.width = `${this.tableContainerParent.getBoundingClientRect().width}px`;
    this.cloneContainerParent.scrollLeft = this.tableContainerParent.scrollLeft;
  }

  private sizeToPx(size: number | string): number {
    if (typeof size === 'number') {
      return size;
    } else if (size.match(/rem$/)) {
      const rem = +size.replace(/rem$/, '');
      return Number.parseFloat(
        window.getComputedStyle(document.getElementsByTagName('html')[0]).fontSize
      ) * rem;
    } else {
      console.error('Unsupported size format for sticky table header displacement.');
      return 0;
    }
  }

  private getTop(): number {
    const windowWidth = document.body.getBoundingClientRect().width;
    const sizes = Object.entries(this.top)
      .filter(([key]) => key !== 'max')
      .sort(([key1], [key2]) => Number.parseInt(key1, 10) - Number.parseInt(key2, 10));

    for (let i = 0, size; (size = sizes[i++]); ) {
      if (windowWidth < Number.parseInt(size[0], 10)) {
        return this.sizeToPx(size[1]);
      }
    }

    return this.sizeToPx(this.top.max);
  }
}
