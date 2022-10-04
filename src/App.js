"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
var React = __importStar(require("react"));
var react_1 = require("react");
var fiber_1 = require("@react-three/fiber");
function Box(props) {
    // This reference will give us direct access to the THREE.Mesh object
    var ref = (0, react_1.useRef)(null);
    // Hold state for hovered and clicked events
    var _a = (0, react_1.useState)(false), hovered = _a[0], hover = _a[1];
    var _b = (0, react_1.useState)(false), clicked = _b[0], click = _b[1];
    // Rotate mesh every frame, this is outside of React without overhead
    (0, fiber_1.useFrame)(function (state, delta) { return (ref.current.rotation.x += 0.01); });
    return (React.createElement("mesh", __assign({}, props, { ref: ref, scale: clicked ? 1.5 : 1, onClick: function (event) { return click(!clicked); }, onPointerOver: function (event) { return hover(true); }, onPointerOut: function (event) { return hover(false); } }),
        React.createElement("boxGeometry", { args: [1, 1, 1] }),
        React.createElement("meshStandardMaterial", { color: hovered ? 'hotpink' : 'orange' })));
}
function App() {
    return (React.createElement(fiber_1.Canvas, null,
        React.createElement("ambientLight", { intensity: 0.5 }),
        React.createElement("spotLight", { position: [10, 10, 10], angle: 0.15, penumbra: 1 }),
        React.createElement("pointLight", { position: [-10, -10, -10] }),
        React.createElement(Box, { position: [-1.2, 0, 0] }),
        React.createElement(Box, { position: [1.2, 0, 0] })));
}
exports["default"] = App;
