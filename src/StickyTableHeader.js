/**
 * This class is used for both table sticky header and horizontal scroll support on tables.
 */
var StickyTableHeader = /** @class */ (function () {
    function StickyTableHeader(tableContainer, cloneContainer, top) {
        this.cloneHeader = null;
        this.scrollParent = null;
        var header = tableContainer.querySelector('thead');
        this.tableContainer = tableContainer;
        this.cloneContainer = cloneContainer;
        this.top = top;
        if (!header || !this.tableContainer.parentNode) {
            throw new Error('Header or parent node of sticky header table container not found!');
        }
        this.tableContainerParent = this.tableContainer.parentNode;
        this.cloneContainerParent = this.cloneContainer.parentNode;
        this.header = header;
        this.scrollParent = this.getScrollParent(this.tableContainer);
        console.log(this.scrollParent);
        this.setup();
    }
    StickyTableHeader.prototype.getScrollParent = function (node) {
        if (node == null) {
            return window;
        }
        if (node.scrollHeight > node.clientHeight) {
            return node;
        }
        else {
            return this.getScrollParent(node.parentNode);
        }
    };
    StickyTableHeader.prototype.destroy = function () {
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
    };
    StickyTableHeader.prototype.setupClickEventMirroring = function () {
        var _this = this;
        this.clickListener = function (event) {
            var containerRect = _this.tableContainer.getBoundingClientRect();
            var cloneRect = _this.cloneContainer.getBoundingClientRect();
            var bodyRect = document.body.getBoundingClientRect();
            window.scrollTo({ top: containerRect.y - bodyRect.y - _this.getTop() - 60 });
            setTimeout(function () {
                containerRect = _this.tableContainer.getBoundingClientRect();
                var originalTarget = document.elementFromPoint(containerRect.x + (event.clientX - cloneRect.x), containerRect.y + (event.clientY - cloneRect.y));
                if (originalTarget && originalTarget.click) {
                    originalTarget.click();
                }
            }, 50);
        };
        this.cloneContainer.addEventListener('click', this.clickListener);
    };
    StickyTableHeader.prototype.setupSticky = function () {
        var _this = this;
        var updateSticky = function () {
            _this.currentFrameRequest = window.requestAnimationFrame(function () {
                var lastElement = _this.tableContainer.querySelector(':scope > tbody > tr:last-child');
                var bodyRectY = document.body.getBoundingClientRect().y;
                var tableRect = _this.tableContainer.getBoundingClientRect();
                var tableOffsetTop = _this.tableContainer.offsetTop;
                var tableTop = tableRect.y - bodyRectY;
                var tableBottom;
                if (lastElement) {
                    tableBottom = lastElement.getBoundingClientRect().y
                        - bodyRectY
                        - _this.header.getBoundingClientRect().height;
                }
                else {
                    tableBottom = tableRect.y + tableRect.height
                        - bodyRectY
                        - _this.header.getBoundingClientRect().height;
                }
                var diffTop = window.scrollY - tableTop;
                var diffBottom = window.scrollY - tableBottom;
                var topPx = _this.getTop();
                if (diffTop > -topPx && null === _this.cloneHeader) {
                    _this.cloneContainerParent.style.display = 'none';
                    _this.cloneHeader = _this.createClone();
                }
                if (null !== _this.cloneHeader) {
                    if (diffTop <= -topPx) {
                        _this.cloneContainerParent.style.display = 'none';
                        _this.cloneContainer.removeChild(_this.cloneHeader);
                        _this.cloneHeader = null;
                    }
                    else if (diffBottom < -topPx) {
                        _this.cloneContainerParent.style.display = 'block';
                        _this.cloneContainerParent.style.position = 'fixed';
                        _this.cloneContainerParent.style.top = "".concat(topPx, "px");
                        _this.setHorizontalScrollOnClone();
                    }
                    else {
                        _this.cloneContainerParent.style.display = 'block';
                        _this.cloneContainerParent.style.position = 'absolute';
                        _this.cloneContainerParent.style.top = "".concat(tableBottom - tableTop + tableOffsetTop, "px");
                    }
                }
            });
        };
        this.scrollListener = function () { return updateSticky(); };
        window.addEventListener('scroll', this.scrollListener);
        updateSticky();
    };
    StickyTableHeader.prototype.setup = function () {
        this.setupSticky();
        this.setupSizeMirroring();
        this.setupClickEventMirroring();
        this.setupHorizontalScrollMirroring();
    };
    StickyTableHeader.prototype.setupSizeMirroring = function () {
        var _this = this;
        this.sizeListener = function () {
            window.requestAnimationFrame(function () {
                var headerSize = _this.header.getBoundingClientRect().width;
                _this.cloneContainer.style.width = "".concat(headerSize, "px");
                _this.cloneContainerParent.style.top = "".concat(_this.getTop(), "px");
                _this.setHorizontalScrollOnClone();
            });
        };
        window.addEventListener('resize', this.sizeListener);
    };
    StickyTableHeader.prototype.setupHorizontalScrollMirroring = function () {
        var _this = this;
        this.containerScrollListener = function () {
            window.requestAnimationFrame(function () {
                _this.setHorizontalScrollOnClone();
            });
        };
        this.tableContainerParent.addEventListener('scroll', this.containerScrollListener);
    };
    StickyTableHeader.prototype.createClone = function () {
        var clone = this.header.cloneNode(true);
        this.cloneContainer.append(clone);
        var headerSize = this.header.getBoundingClientRect().width;
        Array.from(this.header.children[0].children).forEach(function (cell, index) {
            clone.children[0].children[index].style.width =
                (cell.getBoundingClientRect().width / headerSize) * 100 + '%';
        });
        this.cloneContainer.style.display = 'table';
        this.cloneContainer.style.width = "".concat(headerSize, "px");
        this.cloneContainerParent.style.position = 'fixed';
        this.cloneContainerParent.style.overflow = 'hidden';
        this.cloneContainerParent.style.top = "".concat(this.getTop(), "px");
        this.setHorizontalScrollOnClone();
        return clone;
    };
    StickyTableHeader.prototype.setHorizontalScrollOnClone = function () {
        this.cloneContainerParent.style.width = "".concat(this.tableContainerParent.getBoundingClientRect().width, "px");
        this.cloneContainerParent.scrollLeft = this.tableContainerParent.scrollLeft;
    };
    StickyTableHeader.prototype.sizeToPx = function (size) {
        if (typeof size === 'number') {
            return size;
        }
        else if (size.match(/rem$/)) {
            var rem = +size.replace(/rem$/, '');
            return Number.parseFloat(window.getComputedStyle(document.getElementsByTagName('html')[0]).fontSize) * rem;
        }
        else {
            console.error('Unsupported size format for sticky table header displacement.');
            return 0;
        }
    };
    StickyTableHeader.prototype.getTop = function () {
        var windowWidth = document.body.getBoundingClientRect().width;
        var sizes = Object.entries(this.top)
            .filter(function (_a) {
            var key = _a[0];
            return key !== 'max';
        })
            .sort(function (_a, _b) {
            var key1 = _a[0];
            var key2 = _b[0];
            return Number.parseInt(key1, 10) - Number.parseInt(key2, 10);
        });
        for (var i = 0, size = void 0; (size = sizes[i++]);) {
            if (windowWidth < Number.parseInt(size[0], 10)) {
                return this.sizeToPx(size[1]);
            }
        }
        return this.sizeToPx(this.top.max);
    };
    return StickyTableHeader;
}());
export default StickyTableHeader;
//# sourceMappingURL=StickyTableHeader.js.map