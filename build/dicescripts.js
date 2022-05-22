"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const function_plot_1 = __importDefault(require("function-plot"));
let contentsBounds = document.body.getBoundingClientRect();
let width = 800;
let height = 500;
let ratio = contentsBounds.width / width;
width *= ratio;
height *= ratio;
(0, function_plot_1.default)({
    target: "#main-graph",
    width,
    height,
    yAxis: { domain: [-1, 9] },
    grid: true,
    data: [
        {
            fn: "x^2",
            derivative: {
                fn: "2 * x",
                updateOnMouseMove: true
            }
        }
    ]
});
