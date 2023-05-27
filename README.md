# vh-sticky-table-header [![Downloads](https://badgen.net/npm/dw/vh-sticky-table-header)](https://www.npmjs.com/package/vh-sticky-table-header) [![Version](https://badgen.net/npm/v/vh-sticky-table-header)](https://www.npmjs.com/package/vh-sticky-table-header)

JS and CSS driven sticky table header. Good alternative to `position: sticky` when 
horizontal scroll and stickiness is needed as well.

[CODESANDBOX DEMO](https://codesandbox.io/s/vh-sticky-table-header-demo-euykw?file=/src/App.tsx&resolutionWidth=630&resolutionHeight=675)

## Features

- Support vertical and horizontal scroll stickiness at the same time.
- Support for multiple nested scrollable containers.
- [Support different top displacement per viewport width](#top).
- No flickering. Element coordinates are not updated on scroll events.
- [Smaller than 4kb compressed](https://bundlephobia.com/package/vh-sticky-table-header).
- No dependencies. Can be used in any framework.

## Installation and usage
    
```bash
npm i --save vh-sticky-table-header
```

Example usage with React:

```typescript jsx
import { StickyTableHeader } from 'vh-sticky-table-header';
import React, { FC, useLayoutEffect, useRef } from 'react';

const TableWithStickyHeader: FC = ({ children }) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const tableCloneRef = useRef<HTMLTableElement>(null);

  useLayoutEffect(() => {
    if (tableRef.current && tableCloneRef.current) {
      // Initialize the sticky header.
      const sticky = new StickyTableHeader(
        tableRef.current,
        tableCloneRef.current,
        { max: 60 }
      );
      // Make sure to destory the sticky header once the main table is unmounted.
      return () => sticky.destroy();
    }
  }, []);

  return (
    <>
      <div className="table_container">
        <table ref={tableRef}>{children}</table>
      </div>
      <div className="table_container">
        <table ref={tableCloneRef} />
      </div>
    </>
  );
};
```

Example usage with Vue 3:

```html
<script setup>
import { StickyTableHeader } from 'vh-sticky-table-header';
import { onMounted, ref, watchEffect } from 'vue';

const tableRef = ref(null);
const tableCloneRef = ref(null);

onMounted(() => {
    watchEffect((onCleanup) => {
        if (!tableRef.value && !tableCloneRef.value) return;

        const stickyTable = new StickyTableHeader(
            tableRef.value,
            tableCloneRef.value,
            { max: 0 },
        );

        onCleanup(() => stickyTable.destroy();
    });
});

</script>

<template>
  <div class="grid w-full overflow-x-auto overflow-y-hidden md:rounded-lg">
    <table ref="tableRef">
      <slot />
    </table>
  </div>
  <div class="grid w-full overflow-x-auto overflow-y-hidden shadow-md md:rounded-lg">
    <table ref="tableCloneRef" />
  </div>
</template>

```


Requirements (these can be seen in the demo as well):

1. The table container `div` elements should have the following css for vertical scrolling to work:
    ```css
    .table_container {
        width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
    }
    ```
2. The JS logic to determine when to show the sticky header uses `window.document`. The body needs to 
   at be at y = 0 position when the scroll is at y = 0. Make sure that the body is not displaced using 
   child elements with `margin` (ex: in case of sticky site header). Use `padding` instead.

## Options

Options are provided to the constructor of the sticky table header instance.

```typescript
export default class StickyTableHeader {
  constructor(tableContainer: HTMLDivElement, cloneContainer: HTMLTableElement, top: {
    max: number | string;
    [key: number]: number | string;
  });
}
```

#### `tableContainer`

Reference to the main table dom element where content is rendered. Must be a table with a table header.

#### `cloneContainer`

Reference to an empty table dom element. This is where a replica of the table header will be rendered.

#### `top`

Object describing the displacement from top of the viewport for the vertical scrolling.
`max` is the default number of pixels or `rem` from top.
Any other key, defined in number, will represent a different number of pixels or `rem` from top to which to stick,
when the viewport width is less than the key.

## Release notes

#### 1.5.0

- Added support for [multiple scrollable containers](./test/test_multiple_scroll.html). [issue](https://github.com/archfz/vh-sticky-table-header/issues/7)
- Small performance improvements.

#### 1.4.2

- Fix table header sticking at the bottom of last row of an inner table.

#### 1.4.1

- Fix issue with click mirroring not working due to incorrect coordinates.
- Click mirroring now scrolls higher up (+60px) then only the original table header.

#### 1.4.0

- Improve docking when scrolling past container. Now `offsetTop` is added to the absolute position
  of the clone table container.
- Fix issue where horizontal scrolling would not update on the clone containers horizontal scroll
  when the scrolling was done in docking state. [issue](https://github.com/archfz/vh-sticky-table-header/issues/3)

#### 1.3.1

- Remove leftover `console.log`.

#### 1.3.0

- Hide the clone container (display:none) when not sticky. [issue](https://github.com/archfz/vh-sticky-table-header/issues/1)

#### 1.2.1

- Fix issue where quick render and destroy would render the sticky header twice.

#### 1.2.0

- Prevent sticky header overflowing table vertically when scrolling past table.

#### 1.1.2

- Fix ESM module, for webpack compatibility.

#### 1.1.1

- Typing fix.

#### 1.1.0

- Add support for `rem` displacement.
