var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * This class is used for both table sticky header and horizontal scroll support on tables.
 */
var StickyTableHeader = /** @class */ (function () {
    function StickyTableHeader(tableContainer, cloneContainer, top) {
        this.cloneHeader = null;
        this.lastElement = null;
        this.lastElementRefresh = null;
        var header = tableContainer.querySelector('thead');
        this.tableContainer = tableContainer;
        this.cloneContainer = cloneContainer;
        this.top = top || { max: 0 };
        if (!header || !this.tableContainer.parentNode) {
            throw new Error('Header or parent node of sticky header table container not found!');
        }
        this.tableContainerParent = this.tableContainer.parentNode;
        this.cloneContainerParent = this.cloneContainer.parentNode;
        this.header = header;
        this.scrollParents = this.getScrollParents(this.tableContainer);
        this.setup();
    }
    StickyTableHeader.prototype.getScrollParents = function (node) {
        var parents = [];
        var parent = node.parentNode;
        while (parent) {
            if (parent.scrollHeight > parent.clientHeight && parent !== window) {
                parents.push(parent);
            }
            parent = parent.parentNode;
        }
        return parents;
    };
    StickyTableHeader.prototype.destroy = function () {
        var _this = this;
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener);
            this.scrollParents.forEach(function (parent) {
                parent.removeEventListener('scroll', _this.scrollListener);
            });
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
            var currentScroll = document.body.scrollTop;
            console.log(currentScroll);
            window.scrollTo({ top: containerRect.y - bodyRect.y - _this.getTop() - 60 });
            setTimeout(function () {
                containerRect = _this.tableContainer.getBoundingClientRect();
                var originalTarget = document.elementFromPoint(containerRect.x + (event.clientX - cloneRect.x), containerRect.y + (event.clientY - cloneRect.y));
                if (originalTarget && originalTarget.click) {
                    originalTarget.click();
                }
                window.scrollTo({ top: currentScroll });
            }, 50);
        };
        this.cloneContainer.addEventListener('click', this.clickListener);
    };
    StickyTableHeader.prototype.setupSticky = function () {
        var _this = this;
        if (this.cloneContainerParent.parentNode) {
            this.cloneContainerParent.parentNode.style.position = 'relative';
        }
        var updateSticky = function () {
            _this.currentFrameRequest = window.requestAnimationFrame(function () {
                var tableRect = _this.tableContainer.getBoundingClientRect();
                var tableOffsetTop = _this.tableContainer.offsetTop;
                var tableTop = tableRect.y;
                var tableBottom = _this.getBottom();
                var diffTop = -tableTop;
                var diffBottom = -tableBottom;
                var topPx = _this.getTop();
                if (diffTop > -topPx && _this.cloneHeader === null) {
                    _this.cloneContainerParent.style.display = 'none';
                    _this.cloneHeader = _this.createClone();
                }
                if (_this.cloneHeader !== null) {
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
        updateSticky();
        window.addEventListener('scroll', this.scrollListener);
        this.scrollParents.forEach(function (parent) {
            parent.addEventListener('scroll', _this.scrollListener);
        });
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
        Array.from(this.header.children).forEach(function (row, rowIndex) {
            Array.from(row.children).forEach(function (cell, index) {
                clone.children[rowIndex].children[index].style.width =
                    (cell.getBoundingClientRect().width / headerSize) * 100 + '%';
            });
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
        var top = this.sizeToPx(this.top.max);
        var parentTops = this.scrollParents.map(function (c) { return c.getBoundingClientRect().top; });
        return Math.max.apply(Math, __spreadArray([top], parentTops, false));
    };
    StickyTableHeader.prototype.getBottom = function () {
        var tableRect = this.tableContainer.getBoundingClientRect();
        var lastElement = this.getLastElement();
        var headerHeight = this.header.getBoundingClientRect().height;
        var defaultBottom = (lastElement ? lastElement.getBoundingClientRect().y : tableRect.y + tableRect.height) - headerHeight;
        var parentBottoms = this.scrollParents.map(function (c) {
            return c.getBoundingClientRect().bottom - 2 * headerHeight;
        });
        return Math.min.apply(Math, __spreadArray(__spreadArray([defaultBottom], parentBottoms, false), [Number.MAX_VALUE], false));
    };
    StickyTableHeader.prototype.getLastElement = function () {
        var _this = this;
        if (!this.lastElement) {
            this.lastElement = this.tableContainer.querySelector(':scope > tbody > tr:last-child');
            return this.lastElement;
        }
        if (this.lastElementRefresh) {
            clearTimeout(this.lastElementRefresh);
        }
        this.lastElementRefresh = setTimeout(function () { return _this.lastElement; }, 2000);
        return this.lastElement;
    };
    return StickyTableHeader;
}());
export default StickyTableHeader;
//# sourceMappingURL=StickyTableHeader.js.map