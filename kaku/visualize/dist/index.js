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
/* harmony export */   "grid_col": () => (/* binding */ grid_col),
/* harmony export */   "grid_row": () => (/* binding */ grid_row),
/* harmony export */   "convertCoord": () => (/* binding */ convertCoord),
/* harmony export */   "width": () => (/* binding */ width),
/* harmony export */   "height": () => (/* binding */ height),
/* harmony export */   "grid_color": () => (/* binding */ grid_color),
/* harmony export */   "figure_color": () => (/* binding */ figure_color),
/* harmony export */   "figure_alert_color": () => (/* binding */ figure_alert_color),
/* harmony export */   "hole_color": () => (/* binding */ hole_color)
/* harmony export */ });
const rate = 8;
const pad = 100;
const grid_col = 160;
const grid_row = 160;
function convertCoord(x, y) {
    return [x * rate + pad, y * rate + pad];
}
const width = grid_col * rate + pad * 2;
const height = grid_row * rate + pad * 2;
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
    for (let i = 0; i <= _config__WEBPACK_IMPORTED_MODULE_0__.grid_row; i++) {
        ctx.beginPath();
        let [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(0, i);
        ctx.moveTo(x, y);
        [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(_config__WEBPACK_IMPORTED_MODULE_0__.grid_col, i);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    for (let i = 0; i <= _config__WEBPACK_IMPORTED_MODULE_0__.grid_col; i++) {
        ctx.beginPath();
        let [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(i, 0);
        ctx.moveTo(x, y);
        [x, y] = (0,_config__WEBPACK_IMPORTED_MODULE_0__.convertCoord)(i, _config__WEBPACK_IMPORTED_MODULE_0__.grid_row);
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
/* harmony export */   "dist": () => (/* binding */ dist),
/* harmony export */   "figure2graph": () => (/* binding */ figure2graph),
/* harmony export */   "splitPwr": () => (/* binding */ splitPwr),
/* harmony export */   "bane": () => (/* binding */ bane),
/* harmony export */   "graph2vertices": () => (/* binding */ graph2vertices)
/* harmony export */ });
function dist(p, q) {
    const [x0, y0] = p;
    const [x1, y1] = q;
    return (x0 - x1) ** 2 + (y0 - y1) ** 2;
}
function figure2graph(figure) {
    var _a;
    const n_node = figure.vertices.length;
    const graph = {
        nodes: [],
        orig_len: (new Array(n_node))
    };
    for (let i = 0; i < n_node; i++) {
        graph.orig_len[i] = [];
        for (let j = 0; j < n_node; j++) {
            (_a = graph.orig_len[i]) === null || _a === void 0 ? void 0 : _a.push(0);
        }
    }
    figure.vertices.forEach(node => {
        graph.nodes.push({
            p: node,
            edges: []
        });
    });
    figure.edges.forEach(([p, q], i) => {
        var _a, _b;
        (_a = graph.nodes[p]) === null || _a === void 0 ? void 0 : _a.edges.push(q);
        (_b = graph.nodes[q]) === null || _b === void 0 ? void 0 : _b.edges.push(p);
        graph.orig_len[p][q] = figure.orig_len[i];
        graph.orig_len[q][p] = figure.orig_len[i];
    });
    return graph;
}
function splitPwr(n1, n2) {
    // n1 -> n2 vector
    const d = dist(n1, n2);
    return [(n2[0] - n1[0]) / d, (n2[1] - n1[1]) / d];
}
function bane(graph, epsilon, moved) {
    const min_e = 0;
    const k = 1.0;
    const dt = 1;
    const dc = 0.9;
    const n_node = graph.nodes.length;
    const sp = new Array(n_node);
    for (let i = 0; i < sp.length; i++) {
        sp[i] = [0, 0];
    }
    for (let i = 0; i < 10000; i++) {
        let total_e = 0;
        graph.nodes.forEach((n1, s) => {
            if (s == moved) {
                return;
            }
            const p = [0, 0];
            for (const t of n1.edges) {
                const n2 = graph.nodes[t];
                const orig_d = graph.orig_len[s][t];
                const new_d = dist(n1.p, n2.p);
                let pwr = 0;
                if (Math.abs(new_d / orig_d - 1) > (epsilon / 1000000)) {
                    pwr = k * (Math.sqrt(new_d) - Math.sqrt(orig_d));
                }
                const [x, y] = splitPwr(n1.p, n2.p);
                p[0] += pwr * x;
                p[1] += pwr * y;
            }
            sp[s][0] += p[0] * dt;
            sp[s][0] *= dc;
            sp[s][1] += p[1] * dt;
            sp[s][1] *= dc;
        });
        sp.forEach((speed, node) => {
            let [x, y] = graph.nodes[node].p;
            x = Math.round(x + speed[0]);
            y = Math.round(y + speed[1]);
            graph.nodes[node].p = [x, y];
            total_e += dist(speed, [0, 0]);
        });
        if (total_e < min_e)
            break;
    }
}
function graph2vertices(graph) {
    const vertices = [];
    graph.nodes.forEach(node => {
        vertices.push(node.p);
    });
    return vertices;
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

function setOrigLen(figure) {
    const orig_len = [];
    for (const e of figure.edges) {
        orig_len.push((0,_graph__WEBPACK_IMPORTED_MODULE_0__.dist)(figure.vertices[e[0]], figure.vertices[e[1]]));
    }
    figure.orig_len = orig_len;
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
/* harmony import */ var _graph__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./graph */ "./src/graph.ts");




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
// state = {"hole":[[0,4],[11,0],[21,12],[27,0],[41,1],[56,0],[104,0],[104,25],[93,29],[97,41],[104,53],[82,57],[67,57],[58,49],[40,57],[25,57],[12,53],[0,56]],"epsilon":29340,"figure":{"orig_len": [],"edges":[[0,1],[0,3],[1,2],[2,4],[2,5],[3,5],[4,6],[5,7],[6,7],[6,8],[7,9],[8,10],[8,11],[9,10],[10,11]],"vertices":[[26,37],[22,12],[2,20],[4,21],[5,0],[24,29],[25,12],[2,19],[5,23],[20,34],[0,46],[20,40]]}}
// state = {"hole":[[80,125],[70,155],[5,155],[5,80],[45,70],[5,60],[5,5],[75,5],[85,35],[95,5],[155,5],[155,60],[120,75],[155,80],[155,155],[90,155]],"epsilon":375000,"figure":{"orig_len": [],"edges":[[19,28],[28,26],[26,17],[17,16],[16,19],[19,21],[64,57],[57,52],[52,53],[53,67],[67,70],[70,57],[21,64],[64,77],[77,76],[76,63],[63,44],[44,40],[40,25],[25,13],[13,14],[14,15],[15,21],[15,12],[12,11],[11,14],[12,7],[7,5],[5,10],[10,8],[8,3],[3,1],[1,11],[8,11],[10,12],[13,6],[6,9],[9,2],[2,0],[0,4],[4,6],[25,24],[24,29],[29,23],[23,18],[18,24],[40,39],[39,43],[43,44],[43,46],[46,35],[35,34],[34,39],[63,65],[65,73],[73,71],[71,58],[58,65],[77,81],[81,89],[89,91],[91,93],[93,92],[92,89],[84,85],[85,88],[88,87],[87,84],[84,81],[81,78],[78,82],[82,81],[76,83],[83,90],[90,95],[95,94],[94,86],[86,80],[80,75],[75,79],[79,83],[83,86],[22,72],[72,74],[74,20],[20,22],[30,36],[36,37],[37,31],[31,30],[36,41],[41,42],[42,37],[41,49],[49,50],[50,42],[49,54],[54,55],[55,50],[54,61],[61,62],[62,55],[61,68],[68,69],[69,62],[31,20],[69,74],[38,33],[33,27],[27,32],[32,38],[38,45],[45,47],[47,51],[51,48],[48,45],[51,56],[56,60],[60,66],[66,59],[59,56],[66,72],[27,22],[48,49],[74,77],[20,14],[22,25],[72,63]],"vertices":[[1,93],[6,118],[8,103],[8,123],[9,80],[9,128],[13,86],[13,131],[17,119],[19,94],[20,121],[22,115],[25,118],[33,69],[37,98],[42,102],[46,145],[48,152],[54,12],[54,143],[56,92],[58,109],[60,55],[61,7],[61,18],[61,32],[64,152],[65,64],[67,143],[68,13],[69,74],[69,82],[71,71],[72,57],[74,24],[75,21],[75,74],[75,82],[77,65],[78,24],[78,33],[81,74],[81,82],[82,24],[82,34],[82,66],[85,23],[85,63],[85,70],[87,74],[87,82],[88,66],[89,147],[91,152],[93,74],[93,81],[94,65],[95,146],[98,14],[98,70],[99,59],[99,74],[99,80],[101,41],[102,108],[103,22],[103,65],[104,152],[105,74],[105,79],[105,144],[106,12],[111,58],[112,20],[114,87],[125,25],[125,70],[125,85],[129,105],[130,43],[133,26],[133,91],[133,105],[138,47],[138,98],[138,104],[140,43],[144,98],[144,104],[145,89],[148,48],[148,85],[149,92],[152,89],[154,33],[159,36]]}}
(0,_state__WEBPACK_IMPORTED_MODULE_1__.setOrigLen)(state.figure);
(0,_drawState__WEBPACK_IMPORTED_MODULE_2__.updateState)(state, ctx);
const state_text_area = document.getElementById("state");
const update_button = document.getElementById("update");
state_text_area.value = JSON.stringify(state, null, 4);
update_button.addEventListener('click', (_ev) => {
    const new_state = JSON.parse(state_text_area.value);
    let moved = -1;
    for (let i = 0; i < state.figure.vertices.length; i++) {
        const v = state.figure.vertices[i];
        const new_v = new_state.figure.vertices[i];
        if (v[0] !== new_v[0] || v[1] !== new_v[1]) {
            moved = i;
            break;
        }
    }
    state = new_state;
    console.log(moved);
    (0,_drawState__WEBPACK_IMPORTED_MODULE_2__.updateState)(state, ctx);
    setTimeout(() => {
        const graph = (0,_graph__WEBPACK_IMPORTED_MODULE_3__.figure2graph)(state.figure);
        (0,_graph__WEBPACK_IMPORTED_MODULE_3__.bane)(graph, state.epsilon, moved);
        const v = (0,_graph__WEBPACK_IMPORTED_MODULE_3__.graph2vertices)(graph);
        state.figure.vertices = v;
        (0,_drawState__WEBPACK_IMPORTED_MODULE_2__.updateState)(state, ctx);
        state_text_area.value = JSON.stringify(state, null, 4);
    }, 100);
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly92aXN1YWxpemUvLi9zcmMvY29uZmlnLnRzIiwid2VicGFjazovL3Zpc3VhbGl6ZS8uL3NyYy9kcmF3U3RhdGUudHMiLCJ3ZWJwYWNrOi8vdmlzdWFsaXplLy4vc3JjL2dyYXBoLnRzIiwid2VicGFjazovL3Zpc3VhbGl6ZS8uL3NyYy9zdGF0ZS50cyIsIndlYnBhY2s6Ly92aXN1YWxpemUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdmlzdWFsaXplL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly92aXN1YWxpemUvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly92aXN1YWxpemUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly92aXN1YWxpemUvLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNmLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUNULE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQztBQUNyQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUM7QUFFckIsU0FBUyxZQUFZLENBQUMsQ0FBUyxFQUFFLENBQVM7SUFDL0MsT0FBTyxDQUFDLENBQUMsR0FBQyxJQUFJLEdBQUMsR0FBRyxFQUFFLENBQUMsR0FBQyxJQUFJLEdBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQUVNLE1BQU0sS0FBSyxHQUFHLFFBQVEsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN4QyxNQUFNLE1BQU0sR0FBRyxRQUFRLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFFekMsTUFBTSxVQUFVLEdBQUcsc0JBQXNCLENBQUM7QUFDMUMsTUFBTSxZ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QUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQztZQUN4RCxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUM7WUFDdkQsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDO1lBQzNELENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQztTQUNwQztRQUNELFVBQVUsRUFBRTtZQUNWLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FB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R0FBRyxDQUFDLENBQUM7QUFDVixDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuY29uc3QgcmF0ZSA9IDg7XG5jb25zdCBwYWQgPSAxMDA7XG5leHBvcnQgY29uc3QgZ3JpZF9jb2wgPSAxNjA7XG5leHBvcnQgY29uc3QgZ3JpZF9yb3cgPSAxNjA7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0Q29vcmQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgcmV0dXJuIFt4KnJhdGUrcGFkLCB5KnJhdGUrcGFkXTtcbn1cblxuZXhwb3J0IGNvbnN0IHdpZHRoID0gZ3JpZF9jb2wgKiByYXRlICsgcGFkICogMjtcbmV4cG9ydCBjb25zdCBoZWlnaHQgPSBncmlkX3JvdyAqIHJhdGUgKyBwYWQgKiAyO1xuXG5leHBvcnQgY29uc3QgZ3JpZF9jb2xvciA9ICdyZ2IoMTAwLDEwMCwxMDAsMC41KSc7XG5leHBvcnQgY29uc3QgZmlndXJlX2NvbG9yID0gJ3JnYigwMCwwMCwyNTUpJztcbmV4cG9ydCBjb25zdCBmaWd1cmVfYWxlcnRfY29sb3IgPSAncmdiKDI1NSwwMCwwMCknO1xuZXhwb3J0IGNvbnN0IGhvbGVfY29sb3IgPSAncmdiKDAsMCwwKSc7XG4iLCJpbXBvcnQge3dpZHRoLCBoZWlnaHQsIGNvbnZlcnRDb29yZCwgZ3JpZF9jb2xvciwgZmlndXJlX2NvbG9yLCBob2xlX2NvbG9yLCBmaWd1cmVfYWxlcnRfY29sb3IsIGdyaWRfcm93LCBncmlkX2NvbH0gZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgeyBkaXN0IH0gZnJvbSAnLi9ncmFwaCc7XG5pbXBvcnQge0ZpZ3VyZSwgUG9pbnQsIFN0YXRlfSBmcm9tICcuL3N0YXRlJ1xuXG5leHBvcnQgZnVuY3Rpb24gZHJhd0dyaWQoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpOiB2b2lkIHtcbiAgY3R4LnN0cm9rZVN0eWxlID0gZ3JpZF9jb2xvcjsgXG4gIGZvciAobGV0IGkgPSAwOyBpIDw9IGdyaWRfcm93OyBpKyspIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgbGV0IFt4LCB5XSA9IGNvbnZlcnRDb29yZCgwLCBpKTtcbiAgICBjdHgubW92ZVRvKHgsIHkpO1xuICAgIFt4LCB5XSA9IGNvbnZlcnRDb29yZChncmlkX2NvbCwgaSk7XG4gICAgY3R4LmxpbmVUbyh4LCB5KTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gZ3JpZF9jb2w7IGkrKykge1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBsZXQgW3gsIHldID0gY29udmVydENvb3JkKGksIDApO1xuICAgIGN0eC5tb3ZlVG8oeCwgeSk7XG4gICAgW3gsIHldID0gY29udmVydENvb3JkKGksIGdyaWRfcm93KTtcbiAgICBjdHgubGluZVRvKHgsIHkpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhd0ZpZ3VyZShmaWd1cmU6IEZpZ3VyZSwgZXBzaWxvbjogbnVtYmVyLCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IHZvaWQge1xuICBjdHguc3Ryb2tlU3R5bGUgPSBmaWd1cmVfY29sb3I7IFxuICBjdHguZmlsbFN0eWxlID0gZmlndXJlX2NvbG9yO1xuICBmaWd1cmUudmVydGljZXMuZm9yRWFjaChjbyA9PiB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGNvbnN0IFt4LCB5XSA9IGNvbnZlcnRDb29yZChjb1swXSEsIGNvWzFdISk7XG4gICAgY3R4LmFyYyh4LCB5LCAzLCAwLCBNYXRoLlBJKjIsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICB9KTtcblxuICBmaWd1cmUuZWRnZXMuZm9yRWFjaCgoZSwgaSkgPT4ge1xuICAgIGNvbnN0IGZyb20gPSBmaWd1cmUudmVydGljZXNbZVswXV0hO1xuICAgIGNvbnN0IHRvID0gZmlndXJlLnZlcnRpY2VzW2VbMV1dITtcbiAgICBjb25zdCBkID0gZGlzdChmcm9tLCB0byk7XG4gICAgaWYgKE1hdGguYWJzKGQvZmlndXJlLm9yaWdfbGVuW2ldISAtIDEpID4gKGVwc2lsb24vMTAwMDAwMCkpIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGZpZ3VyZV9hbGVydF9jb2xvcjsgXG4gICAgfVxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBsZXQgW3gsIHldID0gY29udmVydENvb3JkKGZyb21bMF0sIGZyb21bMV0pO1xuICAgIGN0eC5tb3ZlVG8oeCwgeSk7XG4gICAgW3gsIHldID0gY29udmVydENvb3JkKHRvWzBdLCB0b1sxXSk7XG4gICAgY3R4LmxpbmVUbyh4LCB5KTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gZmlndXJlX2NvbG9yOyBcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3SG9sZShob2xlOiBQb2ludFtdLCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IHZvaWQge1xuICBjdHguc3Ryb2tlU3R5bGUgPSBob2xlX2NvbG9yOyBcbiAgY3R4LmZpbGxTdHlsZSA9IGhvbGVfY29sb3I7XG4gIGhvbGUuZm9yRWFjaChjbyA9PiB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGNvbnN0IFt4LCB5XSA9IGNvbnZlcnRDb29yZChjb1swXSEsIGNvWzFdISk7XG4gICAgY3R4LmFyYyh4LCB5LCAzLCAwLCBNYXRoLlBJKjIsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICB9KTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGhvbGUubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBmcm9tID0gaG9sZVtpXSE7XG4gICAgY29uc3QgdG8gPSBob2xlWyhpKzEpJWhvbGUubGVuZ3RoXSE7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGxldCBbeCwgeV0gPSBjb252ZXJ0Q29vcmQoZnJvbVswXSEsIGZyb21bMV0hKTtcbiAgICBjdHgubW92ZVRvKHgsIHkpO1xuICAgIFt4LCB5XSA9IGNvbnZlcnRDb29yZCh0b1swXSEsIHRvWzFdISk7XG4gICAgY3R4LmxpbmVUbyh4LCB5KTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVN0YXRlKHN0YXRlOiBTdGF0ZSwgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpOiB2b2lkIHtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgZHJhd0dyaWQoY3R4KTtcbiAgZHJhd0hvbGUoc3RhdGUuaG9sZSwgY3R4KTtcbiAgZHJhd0ZpZ3VyZShzdGF0ZS5maWd1cmUsIHN0YXRlLmVwc2lsb24sIGN0eCk7XG59IiwiaW1wb3J0IHsgRmlndXJlLCBQb2ludCwgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuXG5leHBvcnQgZnVuY3Rpb24gZGlzdChwOiBQb2ludCwgcTogUG9pbnQpOiBudW1iZXIge1xuICBjb25zdCBbeDAsIHkwXSA9IHA7XG4gIGNvbnN0IFt4MSwgeTFdID0gcTtcbiAgcmV0dXJuICh4MC14MSkqKjIgKyAoeTAteTEpKioyO1xufVxuXG50eXBlIEdOb2RlID0ge1xuICBwOiBQb2ludCxcbiAgZWRnZXM6IG51bWJlcltdXG59XG5cbnR5cGUgR3JhcGggPSB7XG4gIG5vZGVzOiBHTm9kZVtdLFxuICBvcmlnX2xlbjogbnVtYmVyW11bXVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlndXJlMmdyYXBoKGZpZ3VyZTogRmlndXJlKTogR3JhcGgge1xuICBjb25zdCBuX25vZGUgPSBmaWd1cmUudmVydGljZXMubGVuZ3RoXG4gIGNvbnN0IGdyYXBoID0ge1xuICAgIG5vZGVzOiBbXSBhcyBHTm9kZVtdLFxuICAgIG9yaWdfbGVuOiAobmV3IEFycmF5KG5fbm9kZSkpIGFzIG51bWJlcltdW11cbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IG5fbm9kZTsgaSsrKSB7XG4gICAgZ3JhcGgub3JpZ19sZW5baV0gPSBbXTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5fbm9kZTsgaisrKSB7XG4gICAgICBncmFwaC5vcmlnX2xlbltpXT8ucHVzaCgwKTtcbiAgICB9XG4gIH1cbiAgZmlndXJlLnZlcnRpY2VzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgZ3JhcGgubm9kZXMucHVzaCh7XG4gICAgICBwOiBub2RlLFxuICAgICAgZWRnZXM6IFtdXG4gICAgfSlcbiAgfSk7XG4gIGZpZ3VyZS5lZGdlcy5mb3JFYWNoKChbcCwgcV0sIGkpID0+IHtcbiAgICBncmFwaC5ub2Rlc1twXT8uZWRnZXMucHVzaChxKTtcbiAgICBncmFwaC5ub2Rlc1txXT8uZWRnZXMucHVzaChwKTtcbiAgICBncmFwaC5vcmlnX2xlbltwXSFbcV0gPSBmaWd1cmUub3JpZ19sZW5baV0hO1xuICAgIGdyYXBoLm9yaWdfbGVuW3FdIVtwXSA9IGZpZ3VyZS5vcmlnX2xlbltpXSE7XG4gIH0pO1xuICByZXR1cm4gZ3JhcGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdFB3cihuMTogUG9pbnQsIG4yOiBQb2ludCk6IFBvaW50IHtcbiAgLy8gbjEgLT4gbjIgdmVjdG9yXG4gIGNvbnN0IGQgPSBkaXN0KG4xLCBuMik7XG4gIHJldHVybiBbKG4yWzBdLW4xWzBdKS9kLCAobjJbMV0tbjFbMV0pL2RdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYW5lKGdyYXBoOiBHcmFwaCwgZXBzaWxvbjogbnVtYmVyLCBtb3ZlZDogbnVtYmVyKSB7XG4gIGNvbnN0IG1pbl9lID0gMDtcbiAgY29uc3QgayA9IDEuMDtcbiAgY29uc3QgZHQgPSAxO1xuICBjb25zdCBkYyA9IDAuOTtcbiAgY29uc3Qgbl9ub2RlID0gZ3JhcGgubm9kZXMubGVuZ3RoO1xuICBjb25zdCBzcCA9IG5ldyBBcnJheShuX25vZGUpIGFzIFBvaW50W107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3AubGVuZ3RoOyBpKyspIHtcbiAgICBzcFtpXSA9IFswLCAwXTtcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDAwOyBpKyspIHtcbiAgICBsZXQgdG90YWxfZSA9IDA7XG4gICAgZ3JhcGgubm9kZXMuZm9yRWFjaCgobjEsIHMpID0+IHtcbiAgICAgIGlmIChzID09IG1vdmVkKSB7IHJldHVybjsgfVxuICAgICAgY29uc3QgcCA9IFswLCAwXTtcbiAgICAgIGZvciAoY29uc3QgdCBvZiBuMS5lZGdlcykge1xuICAgICAgICBjb25zdCBuMiA9IGdyYXBoLm5vZGVzW3RdITtcbiAgICAgICAgY29uc3Qgb3JpZ19kID0gZ3JhcGgub3JpZ19sZW5bc10hW3RdITtcbiAgICAgICAgY29uc3QgbmV3X2QgPSBkaXN0KG4xLnAsIG4yLnApO1xuICAgICAgICBsZXQgcHdyID0gMDtcbiAgICAgICAgaWYgKE1hdGguYWJzKG5ld19kL29yaWdfZCAtIDEpID4gKGVwc2lsb24vMTAwMDAwMCkpIHtcbiAgICAgICAgICBwd3IgPSBrICogKE1hdGguc3FydChuZXdfZCkgLSBNYXRoLnNxcnQob3JpZ19kKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgW3gsIHldID0gc3BsaXRQd3IobjEucCwgbjIucCk7XG4gICAgICAgIHBbMF0gKz0gcHdyICogeDtcbiAgICAgICAgcFsxXSArPSBwd3IgKiB5O1xuICAgICAgfVxuICAgICAgc3Bbc10hWzBdICs9IHBbMF0hICogZHQ7XG4gICAgICBzcFtzXSFbMF0gKj0gZGM7XG4gICAgICBzcFtzXSFbMV0gKz0gcFsxXSEgKiBkdDtcbiAgICAgIHNwW3NdIVsxXSAqPSBkYztcbiAgICB9KTtcbiAgICBzcC5mb3JFYWNoKChzcGVlZCwgbm9kZSkgPT4ge1xuICAgICAgbGV0IFt4LCB5XSA9IGdyYXBoLm5vZGVzW25vZGVdIS5wO1xuICAgICAgeCA9IE1hdGgucm91bmQoeCArIHNwZWVkWzBdKTtcbiAgICAgIHkgPSBNYXRoLnJvdW5kKHkgKyBzcGVlZFsxXSk7XG4gICAgICBncmFwaC5ub2Rlc1tub2RlXSEucCA9IFt4LCB5XTtcbiAgICAgIHRvdGFsX2UgKz0gZGlzdChzcGVlZCwgWzAsIDBdKTtcbiAgICB9KTtcbiAgICBpZiAodG90YWxfZSA8IG1pbl9lKSBicmVhaztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ3JhcGgydmVydGljZXMoZ3JhcGg6IEdyYXBoKTogUG9pbnRbXSB7XG4gIGNvbnN0IHZlcnRpY2VzID0gW10gYXMgUG9pbnRbXTtcbiAgZ3JhcGgubm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICB2ZXJ0aWNlcy5wdXNoKG5vZGUucCk7XG4gIH0pO1xuICByZXR1cm4gdmVydGljZXNcbn0iLCJpbXBvcnQgeyBkaXN0IH0gZnJvbSBcIi4vZ3JhcGhcIjtcblxuZXhwb3J0IHR5cGUgUGFpciA9IFtudW1iZXIsIG51bWJlcl07XG5leHBvcnQgdHlwZSBQb2ludCA9IFBhaXI7XG5cbmV4cG9ydCB0eXBlIEZpZ3VyZSA9IHtcbiAgXCJlZGdlc1wiOiBQYWlyW10sXG4gIFwidmVydGljZXNcIjogUG9pbnRbXSxcbiAgXCJvcmlnX2xlblwiOiBudW1iZXJbXVxufVxuZXhwb3J0IHR5cGUgU3RhdGUgPSB7XG4gIFwiaG9sZVwiOiBQb2ludFtdLFxuICBcImVwc2lsb25cIjogbnVtYmVyLFxuICBcImZpZ3VyZVwiOiBGaWd1cmVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE9yaWdMZW4oZmlndXJlOiBGaWd1cmUpOiB2b2lkIHtcbiAgY29uc3Qgb3JpZ19sZW4gPSBbXTtcbiAgZm9yIChjb25zdCBlIG9mIGZpZ3VyZS5lZGdlcykge1xuICAgIG9yaWdfbGVuLnB1c2goZGlzdChmaWd1cmUudmVydGljZXNbZVswXV0hLCBmaWd1cmUudmVydGljZXNbZVsxXV0hKSk7XG4gIH1cbiAgZmlndXJlLm9yaWdfbGVuID0gb3JpZ19sZW47XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7d2lkdGgsIGhlaWdodH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtGaWd1cmUsIFBvaW50LCBzZXRPcmlnTGVuLCBTdGF0ZX0gZnJvbSAnLi9zdGF0ZSc7XG5pbXBvcnQge3VwZGF0ZVN0YXRlfSBmcm9tICcuL2RyYXdTdGF0ZSc7XG5pbXBvcnQgeyBiYW5lLCBmaWd1cmUyZ3JhcGgsIGdyYXBoMnZlcnRpY2VzIH0gZnJvbSAnLi9ncmFwaCc7XG5cbmNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbmNhbnZhcy53aWR0aCA9IHdpZHRoO1xuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbmNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpITtcblxubGV0IHN0YXRlOiBTdGF0ZSA9IHtcbiAgXCJob2xlXCI6IFtcbiAgICBbNDUsODBdLFszNSw5NV0sWzUsOTVdLFszNSw1MF0sWzUsNV0sWzM1LDVdLFs5NSw5NV0sWzY1LDk1XSxbNTUsODBdXG4gIF0sXG4gIFwiZXBzaWxvblwiOiAxNTAwMDAsXG4gIFwiZmlndXJlXCI6IHtcbiAgICBcImVkZ2VzXCI6IFtcbiAgICAgIFsyLDVdLFs1LDRdLFs0LDFdLFsxLDBdLFswLDhdLFs4LDNdLFszLDddLFs3LDExXSxbMTEsMTNdLFxuICAgICAgWzEzLDEyXSxbMTIsMThdLFsxOCwxOV0sWzE5LDE0XSxbMTQsMTVdLFsxNSwxN10sWzE3LDE2XSxcbiAgICAgIFsxNiwxMF0sWzEwLDZdLFs2LDJdLFs4LDEyXSxbNyw5XSxbOSwzXSxbOCw5XSxbOSwxMl0sWzEzLDldLFxuICAgICAgWzksMTFdLFs0LDhdLFsxMiwxNF0sWzUsMTBdLFsxMCwxNV1cbiAgICBdLFxuICAgIFwidmVydGljZXNcIjogW1xuICAgICAgWzIwLDMwXSxbMjAsNDBdLFszMCw5NV0sWzQwLDE1XSxbNDAsMzVdLFs0MCw2NV0sWzQwLDk1XSxcbiAgICAgIFs0NSw1XSxbNDUsMjVdLFs1MCwxNV0sWzUwLDcwXSxbNTUsNV0sWzU1LDI1XSxbNjAsMTVdLFxuICAgICAgWzYwLDM1XSxbNjAsNjVdLFs2MCw5NV0sWzcwLDk1XSxbODAsMzBdLFs4MCw0MF1cbiAgICBdLFxuICAgIFwib3JpZ19sZW5cIjogW11cbiAgfVxufVxuXG4vLyBzdGF0ZSA9IHtcImhvbGVcIjpbWzAsNF0sWzExLDBdLFsyMSwxMl0sWzI3LDBdLFs0MSwxXSxbNTYsMF0sWzEwNCwwXSxbMTA0LDI1XSxbOTMsMjldLFs5Nyw0MV0sWzEwNCw1M10sWzgyLDU3XSxbNjcsNTddLFs1OCw0OV0sWzQwLDU3XSxbMjUsNTddLFsxMiw1M10sWzAsNTZdXSxcImVwc2lsb25cIjoyOTM0MCxcImZpZ3VyZVwiOntcIm9yaWdfbGVuXCI6IFtdLFwiZWRnZXNcIjpbWzAsMV0sWzAsM10sWzEsMl0sWzIsNF0sWzIsNV0sWzMsNV0sWzQsNl0sWzUsN10sWzYsN10sWzYsOF0sWzcsOV0sWzgsMTBdLFs4LDExXSxbOSwxMF0sWzEwLDExXV0sXCJ2ZXJ0aWNlc1wiOltbMjYsMzddLFsyMiwxMl0sWzIsMjBdLFs0LDIxXSxbNSwwXSxbMjQsMjldLFsyNSwxMl0sWzIsMTldLFs1LDIzXSxbMjAsMzRdLFswLDQ2XSxbMjAsNDBdXX19XG4vLyBzdGF0ZSA9IHtcImhvbGVcIjpbWzgwLDEyNV0sWzcwLDE1NV0sWzUsMTU1XSxbNSw4MF0sWzQ1LDcwXSxbNSw2MF0sWzUsNV0sWzc1LDVdLFs4NSwzNV0sWzk1LDVdLFsxNTUsNV0sWzE1NSw2MF0sWzEyMCw3NV0sWzE1NSw4MF0sWzE1NSwxNTVdLFs5MCwxNTVdXSxcImVwc2lsb25cIjozNzUwMDAsXCJmaWd1cmVcIjp7XCJvcmlnX2xlblwiOiBbXSxcImVkZ2VzXCI6W1sxOSwyOF0sWzI4LDI2XSxbMjYsMTddLFsxNywxNl0sWzE2LDE5XSxbMTksMjFdLFs2NCw1N10sWzU3LDUyXSxbNTIsNTNdLFs1Myw2N10sWzY3LDcwXSxbNzAsNTddLFsyMSw2NF0sWzY0LDc3XSxbNzcsNzZdLFs3Niw2M10sWzYzLDQ0XSxbNDQsNDBdLFs0MCwyNV0sWzI1LDEzXSxbMTMsMTRdLFsxNCwxNV0sWzE1LDIxXSxbMTUsMTJdLFsxMiwxMV0sWzExLDE0XSxbMTIsN10sWzcsNV0sWzUsMTBdLFsxMCw4XSxbOCwzXSxbMywxXSxbMSwxMV0sWzgsMTFdLFsxMCwxMl0sWzEzLDZdLFs2LDldLFs5LDJdLFsyLDBdLFswLDRdLFs0LDZdLFsyNSwyNF0sWzI0LDI5XSxbMjksMjNdLFsyMywxOF0sWzE4LDI0XSxbNDAsMzldLFszOSw0M10sWzQzLDQ0XSxbNDMsNDZdLFs0NiwzNV0sWzM1LDM0XSxbMzQsMzldLFs2Myw2NV0sWzY1LDczXSxbNzMsNzFdLFs3MSw1OF0sWzU4LDY1XSxbNzcsODFdLFs4MSw4OV0sWzg5LDkxXSxbOTEsOTNdLFs5Myw5Ml0sWzkyLDg5XSxbODQsODVdLFs4NSw4OF0sWzg4LDg3XSxbODcsODRdLFs4NCw4MV0sWzgxLDc4XSxbNzgsODJdLFs4Miw4MV0sWzc2LDgzXSxbODMsOTBdLFs5MCw5NV0sWzk1LDk0XSxbOTQsODZdLFs4Niw4MF0sWzgwLDc1XSxbNzUsNzldLFs3OSw4M10sWzgzLDg2XSxbMjIsNzJdLFs3Miw3NF0sWzc0LDIwXSxbMjAsMjJdLFszMCwzNl0sWzM2LDM3XSxbMzcsMzFdLFszMSwzMF0sWzM2LDQxXSxbNDEsNDJdLFs0MiwzN10sWzQxLDQ5XSxbNDksNTBdLFs1MCw0Ml0sWzQ5LDU0XSxbNTQsNTVdLFs1NSw1MF0sWzU0LDYxXSxbNjEsNjJdLFs2Miw1NV0sWzYxLDY4XSxbNjgsNjldLFs2OSw2Ml0sWzMxLDIwXSxbNjksNzRdLFszOCwzM10sWzMzLDI3XSxbMjcsMzJdLFszMiwzOF0sWzM4LDQ1XSxbNDUsNDddLFs0Nyw1MV0sWzUxLDQ4XSxbNDgsNDVdLFs1MSw1Nl0sWzU2LDYwXSxbNjAsNjZdLFs2Niw1OV0sWzU5LDU2XSxbNjYsNzJdLFsyNywyMl0sWzQ4LDQ5XSxbNzQsNzddLFsyMCwxNF0sWzIyLDI1XSxbNzIsNjNdXSxcInZlcnRpY2VzXCI6W1sxLDkzXSxbNiwxMThdLFs4LDEwM10sWzgsMTIzXSxbOSw4MF0sWzksMTI4XSxbMTMsODZdLFsxMywxMzFdLFsxNywxMTldLFsxOSw5NF0sWzIwLDEyMV0sWzIyLDExNV0sWzI1LDExOF0sWzMzLDY5XSxbMzcsOThdLFs0MiwxMDJdLFs0NiwxNDVdLFs0OCwxNTJdLFs1NCwxMl0sWzU0LDE0M10sWzU2LDkyXSxbNTgsMTA5XSxbNjAsNTVdLFs2MSw3XSxbNjEsMThdLFs2MSwzMl0sWzY0LDE1Ml0sWzY1LDY0XSxbNjcsMTQzXSxbNjgsMTNdLFs2OSw3NF0sWzY5LDgyXSxbNzEsNzFdLFs3Miw1N10sWzc0LDI0XSxbNzUsMjFdLFs3NSw3NF0sWzc1LDgyXSxbNzcsNjVdLFs3OCwyNF0sWzc4LDMzXSxbODEsNzRdLFs4MSw4Ml0sWzgyLDI0XSxbODIsMzRdLFs4Miw2Nl0sWzg1LDIzXSxbODUsNjNdLFs4NSw3MF0sWzg3LDc0XSxbODcsODJdLFs4OCw2Nl0sWzg5LDE0N10sWzkxLDE1Ml0sWzkzLDc0XSxbOTMsODFdLFs5NCw2NV0sWzk1LDE0Nl0sWzk4LDE0XSxbOTgsNzBdLFs5OSw1OV0sWzk5LDc0XSxbOTksODBdLFsxMDEsNDFdLFsxMDIsMTA4XSxbMTAzLDIyXSxbMTAzLDY1XSxbMTA0LDE1Ml0sWzEwNSw3NF0sWzEwNSw3OV0sWzEwNSwxNDRdLFsxMDYsMTJdLFsxMTEsNThdLFsxMTIsMjBdLFsxMTQsODddLFsxMjUsMjVdLFsxMjUsNzBdLFsxMjUsODVdLFsxMjksMTA1XSxbMTMwLDQzXSxbMTMzLDI2XSxbMTMzLDkxXSxbMTMzLDEwNV0sWzEzOCw0N10sWzEzOCw5OF0sWzEzOCwxMDRdLFsxNDAsNDNdLFsxNDQsOThdLFsxNDQsMTA0XSxbMTQ1LDg5XSxbMTQ4LDQ4XSxbMTQ4LDg1XSxbMTQ5LDkyXSxbMTUyLDg5XSxbMTU0LDMzXSxbMTU5LDM2XV19fVxuXG5zZXRPcmlnTGVuKHN0YXRlLmZpZ3VyZSk7XG51cGRhdGVTdGF0ZShzdGF0ZSwgY3R4KTtcblxuY29uc3Qgc3RhdGVfdGV4dF9hcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGF0ZVwiKSBhcyBIVE1MVGV4dEFyZWFFbGVtZW50O1xuY29uc3QgdXBkYXRlX2J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXBkYXRlXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuXG5zdGF0ZV90ZXh0X2FyZWEudmFsdWUgPSBKU09OLnN0cmluZ2lmeShzdGF0ZSwgbnVsbCwgNCk7XG51cGRhdGVfYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKF9ldjogTW91c2VFdmVudCkgPT4ge1xuICBjb25zdCBuZXdfc3RhdGUgPSBKU09OLnBhcnNlKHN0YXRlX3RleHRfYXJlYS52YWx1ZSkgYXMgU3RhdGU7XG4gIGxldCBtb3ZlZCA9IC0xO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YXRlLmZpZ3VyZS52ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHYgPSBzdGF0ZS5maWd1cmUudmVydGljZXNbaV0hO1xuICAgIGNvbnN0IG5ld192ID0gbmV3X3N0YXRlLmZpZ3VyZS52ZXJ0aWNlc1tpXSE7XG4gICAgaWYgKHZbMF0gIT09IG5ld192WzBdIHx8IHZbMV0gIT09IG5ld192WzFdKSB7XG4gICAgICBtb3ZlZCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgc3RhdGUgPSBuZXdfc3RhdGU7XG4gIGNvbnNvbGUubG9nKG1vdmVkKTtcbiAgdXBkYXRlU3RhdGUoc3RhdGUsIGN0eCk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGNvbnN0IGdyYXBoID0gZmlndXJlMmdyYXBoKHN0YXRlLmZpZ3VyZSk7XG4gICAgYmFuZShncmFwaCwgc3RhdGUuZXBzaWxvbiwgbW92ZWQpO1xuICAgIGNvbnN0IHYgPSBncmFwaDJ2ZXJ0aWNlcyhncmFwaCk7XG4gICAgc3RhdGUuZmlndXJlLnZlcnRpY2VzID0gdjtcbiAgICB1cGRhdGVTdGF0ZShzdGF0ZSwgY3R4KTtcbiAgICBzdGF0ZV90ZXh0X2FyZWEudmFsdWUgPSBKU09OLnN0cmluZ2lmeShzdGF0ZSwgbnVsbCwgNCk7XG4gIH0sIDEwMCk7XG59KTsiXSwic291cmNlUm9vdCI6IiJ9