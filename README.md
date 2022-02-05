# vh-sticky-table-header

Sticky HTML table header. Good alternative to `position: sticky` when horizontal scroll and stickiness 
is needed as well.

## Features

- Support vertical and horizontal scroll stickiness at the same time.
- Support different top displacement per viewport width.
- No flickering, element coordinates are not updated on scroll events.
- Smaller than 5kb compressed.
- No dependencies. Can be used in any framework.

## Installation

```bash
npm i --save vh-sticky-table-header
```

Example usage with React:

```typescript jsx
import { StickyTableHeader } from 'vh-sticky-table-header';
import React, { FC, useLayoutEffect, useRef } from 'react';

const TableWithStickyHeader: FC = () => {
  const tableRef = useRef<HTMLTableElement>(null);
  const tableCloneRef = useRef<HTMLTableElement>(null);

  useLayoutEffect(() => {
    if (tableRef.current && tableCloneRef.current) {
      // Initialize the sticky header.
      const sticky = new StickyTableHeader(tableRef.current, tableCloneRef.current, {max: 60});
      // Make sure to destory the sticky header once the main table is unmounted.
      return () => sticky.destroy();
    }
  }, [tableRef.current, tableCloneRef.current]);

  return (
    <div>
      <table ref={tableRef}>
        {/* ... header and rows of main table ... */}
      </table>
      <table ref={tableCloneRef} />
    </div>
  );
};

export default HmtDataGrid;
```

## Options

Options are provided to the constructor of the sticky table header instance.

```typescript
export default class StickyTableHeader {
  constructor(tableContainer: HTMLDivElement, cloneContainer: HTMLTableElement, top: {
    max: number;
    [key: number]: number;
  });
}
```

#### `tableContainer`

Reference to the main table dom element where content is rendered. Must be a table with a table header.

#### `cloneContainer`

Reference to an empty table dom element. This is where a replica of the table header will be rendered.

#### `top`

Object describing the displacement from top of the viewport for the vertical scrolling.
`max` is the default number of pixels from top.
Any other key, defined in number, will represent a different number of pixels from top to which to stick,
when the viewport width is less than the key.
