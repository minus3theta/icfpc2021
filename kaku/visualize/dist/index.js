/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/config.ts":
/*!***********************!*\
  !*** ./src/config.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "convertCoord": () => (/* binding */ convertCoord),
/* harmony export */   "width": () => (/* binding */ width),
/* harmony export */   "height": () => (/* binding */ height),
/* harmony export */   "grid_color": () => (/* binding */ grid_color),
/* harmony export */   "figure_color": () => (/* binding */ figure_color),
/* harmony export */   "figure_alert_color": () => (/* binding */ figure_alert_color),
/* harmony export */   "hole_color": () => (/* binding */ hole_color)
/* harmony export */ });
const rate = 10;
const pad = 100;
function convertCoord(x, y) {
    return [x * rate + pad, y * rate + pad];
}
const width = 100 * rate + pad;
const height = 100 * rate + pad;
const grid_color = 'rgb(100,100,100,0.5)';
const figure_color = 'rgb(00,00,255)';
const figure_alert_color = 'rgb(255,00,00)';
const hole_color = 'rgb(0,0,0)';


/***/ }),

/***/ "./src/drawState.ts":
/*!**************************!*\
  !*** ./src/drawState.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "drawGrid": () => (/* binding */ drawGrid),
/* harmony export */   "drawFigure": () => (/* binding */ drawFigure),
/* harmony export */   "drawHole": () => (/* binding */ drawHole),
/* harmony export */   "updateState": () => (/* binding */ updateState)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ "./src/config.ts");
/* harmony import */ var _graph__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./graph */ "./src/graph.ts");


function drawGrid(ctx) {
    ctx.strokeStyle = _config__WEBPACK_IMPORTED_MODULE_0__.grid_color;
    for (let i = 0; i <= 100; i++) {
        ctx.beginPath();
        let [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(0, i);
        ctx.moveTo(x, y);
        [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(100, i);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(i, 0);
        ctx.moveTo(x, y);
        [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(i, 100);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}
function drawFigure(figure, epsilon, ctx) {
    ctx.strokeStyle = _config__WEBPACK_IMPORTED_MODULE_0__.figure_color;
    ctx.fillStyle = _config__WEBPACK_IMPORTED_MODULE_0__.figure_color;
    figure.vertices.forEach(co => {
        ctx.beginPath();
        const [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(co[0], co[1]);
        ctx.arc(x, y, 3, 0, Math.PI * 2, false);
        ctx.fill();
    });
    figure.edges.forEach((e, i) => {
        const from = figure.vertices[e[0]];
        const to = figure.vertices[e[1]];
        const d = (0,_graph__WEBPACK_IMPORTED_MODULE_1__.dist)(from, to);
        if (Math.abs(d / figure.orig_len[i] - 1) > (epsilon / 1000000)) {
            ctx.strokeStyle = _config__WEBPACK_IMPORTED_MODULE_0__.figure_alert_color;
        }
        ctx.beginPath();
        let [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(from[0], from[1]);
        ctx.moveTo(x, y);
        [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(to[0], to[1]);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.strokeStyle = _config__WEBPACK_IMPORTED_MODULE_0__.figure_color;
    });
}
function drawHole(hole, ctx) {
    ctx.strokeStyle = _config__WEBPACK_IMPORTED_MODULE_0__.hole_color;
    ctx.fillStyle = _config__WEBPACK_IMPORTED_MODULE_0__.hole_color;
    hole.forEach(co => {
        ctx.beginPath();
        const [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(co[0], co[1]);
        ctx.arc(x, y, 3, 0, Math.PI * 2, false);
        ctx.fill();
    });
    for (let i = 0; i < hole.length; i++) {
        const from = hole[i];
        const to = hole[(i + 1) % hole.length];
        ctx.beginPath();
        let [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(from[0], from[1]);
        ctx.moveTo(x, y);
        [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(to[0], to[1]);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}
function updateState(state, ctx) {
    ctx.clearRect(0, 0, _config__WEBPACK_IMPORTED_MODULE_0__.width, _config__WEBPACK_IMPORTED_MODULE_0__.height);
    drawGrid(ctx);
    drawHole(state.hole, ctx);
    drawFigure(state.figure, state.epsilon, ctx);
}


/***/ }),

/***/ "./src/graph.ts":
/*!**********************!*\
  !*** ./src/graph.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "dist": () => (/* binding */ dist)
/* harmony export */ });
function dist(p, q) {
    const [x0, y0] = p;
    const [x1, y1] = q;
    return (x0 - x1) ** 2 + (y0 - y1) ** 2;
}


/***/ }),

/***/ "./src/state.ts":
/*!**********************!*\
  !*** ./src/state.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setOrigLen": () => (/* binding */ setOrigLen)
/* harmony export */ });
/* harmony import */ var _graph__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./graph */ "./src/graph.ts");

function setOrigLen(state) {
    const orig_len = [];
    for (const e of state.figure.edges) {
        orig_len.push((0,_graph__WEBPACK_IMPORTED_MODULE_0__.dist)(state.figure.vertices[e[0]], state.figure.vertices[e[1]]));
    }
    state.figure.orig_len = orig_len;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ "./src/config.ts");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./state */ "./src/state.ts");
/* harmony import */ var _drawState__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./drawState */ "./src/drawState.ts");



const canvas = document.getElementById('canvas');
canvas.width = _config__WEBPACK_IMPORTED_MODULE_0__.width;
canvas.height = _config__WEBPACK_IMPORTED_MODULE_0__.height;
const ctx = canvas.getContext('2d');
let state = {
    "hole": [
        [45, 80], [35, 95], [5, 95], [35, 50], [5, 5], [35, 5], [95, 95], [65, 95], [55, 80]
    ],
    "epsilon": 150000,
    "figure": {
        "edges": [
            [2, 5], [5, 4], [4, 1], [1, 0], [0, 8], [8, 3], [3, 7], [7, 11], [11, 13],
            [13, 12], [12, 18], [18, 19], [19, 14], [14, 15], [15, 17], [17, 16],
            [16, 10], [10, 6], [6, 2], [8, 12], [7, 9], [9, 3], [8, 9], [9, 12], [13, 9],
            [9, 11], [4, 8], [12, 14], [5, 10], [10, 15]
        ],
        "vertices": [
            [20, 30], [20, 40], [30, 95], [40, 15], [40, 35], [40, 65], [40, 95],
            [45, 5], [45, 25], [50, 15], [50, 70], [55, 5], [55, 25], [60, 15],
            [60, 35], [60, 65], [60, 95], [70, 95], [80, 30], [80, 40]
        ],
        "orig_len": []
    }
};
(0,_state__WEBPACK_IMPORTED_MODULE_1__.setOrigLen)(state);
(0,_drawState__WEBPACK_IMPORTED_MODULE_2__.updateState)(state, ctx);
const state_text_area = document.getElementById("state");
const update_button = document.getElementById("update");
state_text_area.value = JSON.stringify(state, null, 4);
update_button.addEventListener('click', (_ev) => {
    state = JSON.parse(state_text_area.value);
    (0,_drawState__WEBPACK_IMPORTED_MODULE_2__.updateState)(state, ctx);
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly92aXN1YWxpemUvLi9zcmMvY29uZmlnLnRzIiwid2VicGFjazovL3Zpc3VhbGl6ZS8uL3NyYy9kcmF3U3RhdGUudHMiLCJ3ZWJwYWNrOi8vdmlzdWFsaXplLy4vc3JjL2dyYXBoLnRzIiwid2VicGFjazovL3Zpc3VhbGl6ZS8uL3NyYy9zdGF0ZS50cyIsIndlYnBhY2s6Ly92aXN1YWxpemUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdmlzdWFsaXplL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly92aXN1YWxpemUvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly92aXN1YWxpemUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly92aXN1YWxpemUvLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7QUFDaEIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBRVQsU0FBUyxZQUFZLENBQUMsQ0FBUyxFQUFFLENBQVM7SUFDL0MsT0FBTyxDQUFDLENBQUMsR0FBQyxJQUFJLEdBQUMsR0FBRyxFQUFFLENBQUMsR0FBQyxJQUFJLEdBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQUVNLE1BQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQy9CLE1BQU0sTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBRWhDLE1BQU0sVUFBVSxHQUFHLHNCQUFzQixDQUFDO0FBQzFDLE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDO0FBQ3RDLE1BQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUM7QUFDNUMsTUFBTSxVQUFVLEdBQUcsWUFBWSxD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QUFDdkIsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUUsQ0FBQztBQUVyQyxJQUFJLEtBQUssR0FBVTtJQUNqQixNQUFNLEVBQUU7UUFDTixDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUM7S0FDcEU7SUFDRCxTQUFTLEVBQUUsTUFBTTtJQUNqQixRQUFRLEVBQUU7UUFDUixPQUFPLEVBQUU7WUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUM7WUFDeEQsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDO1lBQ3ZELENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQztZQUMzRCxDQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUM7U0FDcEM7UUFDRCxVQUFVLEVBQUU7WUFDVixDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUM7WUFDdkQsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDO1lBQ3JELENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQztTQUNoRDtRQUNELFVBQVUsRUFBRSxFQUFFO0tBQ2Y7Q0FDRjtBQUVELGtEQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEIsdURBQVcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFeEIsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQXdCLENBQUM7QUFDaEYsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQXNCLENBQUM7QUFFN0UsZUFBZSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkQsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQWUsRUFBRSxFQUFFO0lBQzFELEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQVUsQ0FBQztJQUNuRCx1REFBVyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuY29uc3QgcmF0ZSA9IDEwO1xuY29uc3QgcGFkID0gMTAwO1xuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydENvb3JkKHg6IG51bWJlciwgeTogbnVtYmVyKTogW251bWJlciwgbnVtYmVyXSB7XG4gIHJldHVybiBbeCpyYXRlK3BhZCwgeSpyYXRlK3BhZF07XG59XG5cbmV4cG9ydCBjb25zdCB3aWR0aCA9IDEwMCAqIHJhdGUgKyBwYWQ7XG5leHBvcnQgY29uc3QgaGVpZ2h0ID0gMTAwICogcmF0ZSArIHBhZDtcblxuZXhwb3J0IGNvbnN0IGdyaWRfY29sb3IgPSAncmdiKDEwMCwxMDAsMTAwLDAuNSknO1xuZXhwb3J0IGNvbnN0IGZpZ3VyZV9jb2xvciA9ICdyZ2IoMDAsMDAsMjU1KSc7XG5leHBvcnQgY29uc3QgZmlndXJlX2FsZXJ0X2NvbG9yID0gJ3JnYigyNTUsMDAsMDApJztcbmV4cG9ydCBjb25zdCBob2xlX2NvbG9yID0gJ3JnYigwLDAsMCknO1xuIiwiaW1wb3J0IHt3aWR0aCwgaGVpZ2h0LCBjb252ZXJ0Q29vcmQsIGdyaWRfY29sb3IsIGZpZ3VyZV9jb2xvciwgaG9sZV9jb2xvciwgZmlndXJlX2FsZXJ0X2NvbG9yfSBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7IGRpc3QgfSBmcm9tICcuL2dyYXBoJztcbmltcG9ydCB7RmlndXJlLCBQb2ludCwgU3RhdGV9IGZyb20gJy4vc3RhdGUnXG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3R3JpZChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IHZvaWQge1xuICBjdHguc3Ryb2tlU3R5bGUgPSBncmlkX2NvbG9yOyBcbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gMTAwOyBpKyspIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgbGV0IFt4LCB5XSA9IGNvbnZlcnRDb29yZCgwLCBpKTtcbiAgICBjdHgubW92ZVRvKHgsIHkpO1xuICAgIFt4LCB5XSA9IGNvbnZlcnRDb29yZCgxMDAsIGkpO1xuICAgIGN0eC5saW5lVG8oeCwgeSk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBbeCwgeV0gPSBjb252ZXJ0Q29vcmQoaSwgMCk7XG4gICAgY3R4Lm1vdmVUbyh4LCB5KTtcbiAgICBbeCwgeV0gPSBjb252ZXJ0Q29vcmQoaSwgMTAwKTtcbiAgICBjdHgubGluZVRvKHgsIHkpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhd0ZpZ3VyZShmaWd1cmU6IEZpZ3VyZSwgZXBzaWxvbjogbnVtYmVyLCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IHZvaWQge1xuICBjdHguc3Ryb2tlU3R5bGUgPSBmaWd1cmVfY29sb3I7IFxuICBjdHguZmlsbFN0eWxlID0gZmlndXJlX2NvbG9yO1xuICBmaWd1cmUudmVydGljZXMuZm9yRWFjaChjbyA9PiB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGNvbnN0IFt4LCB5XSA9IGNvbnZlcnRDb29yZChjb1swXSEsIGNvWzFdISk7XG4gICAgY3R4LmFyYyh4LCB5LCAzLCAwLCBNYXRoLlBJKjIsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICB9KTtcblxuICBmaWd1cmUuZWRnZXMuZm9yRWFjaCgoZSwgaSkgPT4ge1xuICAgIGNvbnN0IGZyb20gPSBmaWd1cmUudmVydGljZXNbZVswXV0hO1xuICAgIGNvbnN0IHRvID0gZmlndXJlLnZlcnRpY2VzW2VbMV1dITtcbiAgICBjb25zdCBkID0gZGlzdChmcm9tLCB0byk7XG4gICAgaWYgKE1hdGguYWJzKGQvZmlndXJlLm9yaWdfbGVuW2ldISAtIDEpID4gKGVwc2lsb24vMTAwMDAwMCkpIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGZpZ3VyZV9hbGVydF9jb2xvcjsgXG4gICAgfVxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBsZXQgW3gsIHldID0gY29udmVydENvb3JkKGZyb21bMF0sIGZyb21bMV0pO1xuICAgIGN0eC5tb3ZlVG8oeCwgeSk7XG4gICAgW3gsIHldID0gY29udmVydENvb3JkKHRvWzBdLCB0b1sxXSk7XG4gICAgY3R4LmxpbmVUbyh4LCB5KTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gZmlndXJlX2NvbG9yOyBcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3SG9sZShob2xlOiBQb2ludFtdLCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IHZvaWQge1xuICBjdHguc3Ryb2tlU3R5bGUgPSBob2xlX2NvbG9yOyBcbiAgY3R4LmZpbGxTdHlsZSA9IGhvbGVfY29sb3I7XG4gIGhvbGUuZm9yRWFjaChjbyA9PiB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGNvbnN0IFt4LCB5XSA9IGNvbnZlcnRDb29yZChjb1swXSEsIGNvWzFdISk7XG4gICAgY3R4LmFyYyh4LCB5LCAzLCAwLCBNYXRoLlBJKjIsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICB9KTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGhvbGUubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBmcm9tID0gaG9sZVtpXSE7XG4gICAgY29uc3QgdG8gPSBob2xlWyhpKzEpJWhvbGUubGVuZ3RoXSE7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGxldCBbeCwgeV0gPSBjb252ZXJ0Q29vcmQoZnJvbVswXSEsIGZyb21bMV0hKTtcbiAgICBjdHgubW92ZVRvKHgsIHkpO1xuICAgIFt4LCB5XSA9IGNvbnZlcnRDb29yZCh0b1swXSEsIHRvWzFdISk7XG4gICAgY3R4LmxpbmVUbyh4LCB5KTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVN0YXRlKHN0YXRlOiBTdGF0ZSwgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpOiB2b2lkIHtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgZHJhd0dyaWQoY3R4KTtcbiAgZHJhd0hvbGUoc3RhdGUuaG9sZSwgY3R4KTtcbiAgZHJhd0ZpZ3VyZShzdGF0ZS5maWd1cmUsIHN0YXRlLmVwc2lsb24sIGN0eCk7XG59IiwiaW1wb3J0IHsgUG9pbnQgfSBmcm9tICcuL3N0YXRlJ1xuXG5leHBvcnQgZnVuY3Rpb24gZGlzdChwOiBQb2ludCwgcTogUG9pbnQpOiBudW1iZXIge1xuICBjb25zdCBbeDAsIHkwXSA9IHA7XG4gIGNvbnN0IFt4MSwgeTFdID0gcTtcbiAgcmV0dXJuICh4MC14MSkqKjIgKyAoeTAteTEpKioyO1xufVxuXG4iLCJpbXBvcnQgeyBkaXN0IH0gZnJvbSBcIi4vZ3JhcGhcIjtcblxuZXhwb3J0IHR5cGUgUGFpciA9IFtudW1iZXIsIG51bWJlcl07XG5leHBvcnQgdHlwZSBQb2ludCA9IFBhaXI7XG5cbmV4cG9ydCB0eXBlIEZpZ3VyZSA9IHtcbiAgXCJlZGdlc1wiOiBQYWlyW10sXG4gIFwidmVydGljZXNcIjogUG9pbnRbXSxcbiAgXCJvcmlnX2xlblwiOiBudW1iZXJbXVxufVxuZXhwb3J0IHR5cGUgU3RhdGUgPSB7XG4gIFwiaG9sZVwiOiBQb2ludFtdLFxuICBcImVwc2lsb25cIjogbnVtYmVyLFxuICBcImZpZ3VyZVwiOiBGaWd1cmVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE9yaWdMZW4oc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IG9yaWdfbGVuID0gW107XG4gIGZvciAoY29uc3QgZSBvZiBzdGF0ZS5maWd1cmUuZWRnZXMpIHtcbiAgICBvcmlnX2xlbi5wdXNoKGRpc3Qoc3RhdGUuZmlndXJlLnZlcnRpY2VzW2VbMF1dISwgc3RhdGUuZmlndXJlLnZlcnRpY2VzW2VbMV1dISkpO1xuICB9XG4gIHN0YXRlLmZpZ3VyZS5vcmlnX2xlbiA9IG9yaWdfbGVuO1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQge3dpZHRoLCBoZWlnaHR9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7RmlndXJlLCBQb2ludCwgc2V0T3JpZ0xlbiwgU3RhdGV9IGZyb20gJy4vc3RhdGUnO1xuaW1wb3J0IHt1cGRhdGVTdGF0ZX0gZnJvbSAnLi9kcmF3U3RhdGUnO1xuXG5jb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG5jYW52YXMud2lkdGggPSB3aWR0aDtcbmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG5jb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSE7XG5cbmxldCBzdGF0ZTogU3RhdGUgPSB7XG4gIFwiaG9sZVwiOiBbXG4gICAgWzQ1LDgwXSxbMzUsOTVdLFs1LDk1XSxbMzUsNTBdLFs1LDVdLFszNSw1XSxbOTUsOTVdLFs2NSw5NV0sWzU1LDgwXVxuICBdLFxuICBcImVwc2lsb25cIjogMTUwMDAwLFxuICBcImZpZ3VyZVwiOiB7XG4gICAgXCJlZGdlc1wiOiBbXG4gICAgICBbMiw1XSxbNSw0XSxbNCwxXSxbMSwwXSxbMCw4XSxbOCwzXSxbMyw3XSxbNywxMV0sWzExLDEzXSxcbiAgICAgIFsxMywxMl0sWzEyLDE4XSxbMTgsMTldLFsxOSwxNF0sWzE0LDE1XSxbMTUsMTddLFsxNywxNl0sXG4gICAgICBbMTYsMTBdLFsxMCw2XSxbNiwyXSxbOCwxMl0sWzcsOV0sWzksM10sWzgsOV0sWzksMTJdLFsxMyw5XSxcbiAgICAgIFs5LDExXSxbNCw4XSxbMTIsMTRdLFs1LDEwXSxbMTAsMTVdXG4gICAgXSxcbiAgICBcInZlcnRpY2VzXCI6IFtcbiAgICAgIFsyMCwzMF0sWzIwLDQwXSxbMzAsOTVdLFs0MCwxNV0sWzQwLDM1XSxbNDAsNjVdLFs0MCw5NV0sXG4gICAgICBbNDUsNV0sWzQ1LDI1XSxbNTAsMTVdLFs1MCw3MF0sWzU1LDVdLFs1NSwyNV0sWzYwLDE1XSxcbiAgICAgIFs2MCwzNV0sWzYwLDY1XSxbNjAsOTVdLFs3MCw5NV0sWzgwLDMwXSxbODAsNDBdXG4gICAgXSxcbiAgICBcIm9yaWdfbGVuXCI6IFtdXG4gIH1cbn1cblxuc2V0T3JpZ0xlbihzdGF0ZSk7XG51cGRhdGVTdGF0ZShzdGF0ZSwgY3R4KTtcblxuY29uc3Qgc3RhdGVfdGV4dF9hcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGF0ZVwiKSBhcyBIVE1MVGV4dEFyZWFFbGVtZW50O1xuY29uc3QgdXBkYXRlX2J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXBkYXRlXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuXG5zdGF0ZV90ZXh0X2FyZWEudmFsdWUgPSBKU09OLnN0cmluZ2lmeShzdGF0ZSwgbnVsbCwgNCk7XG51cGRhdGVfYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKF9ldjogTW91c2VFdmVudCkgPT4ge1xuICBzdGF0ZSA9IEpTT04ucGFyc2Uoc3RhdGVfdGV4dF9hcmVhLnZhbHVlKSBhcyBTdGF0ZTtcbiAgdXBkYXRlU3RhdGUoc3RhdGUsIGN0eCk7XG59KTsiXSwic291cmNlUm9vdCI6IiJ9