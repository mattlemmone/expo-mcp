#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fastmcp_1 = require("fastmcp");
var zod_1 = require("zod");
var fs = require("fs/promises");
var path = require("path");
// Create a new FastMCP server
var server = new fastmcp_1.FastMCP({
    name: "File Server",
    version: "1.0.0",
});
// Define the readFile tool
server.addTool({
    name: "readFile",
    description: "Read the contents of a file",
    parameters: zod_1.z.object({
        filePath: zod_1.z.string().describe("The path to the file to read"),
    }),
    execute: function (args_1, _a) { return __awaiter(void 0, [args_1, _a], void 0, function (args, _b) {
        var normalizedPath, fileContent, error_1;
        var log = _b.log;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    log.info("Reading file at path: ".concat(args.filePath));
                    normalizedPath = path.normalize(args.filePath);
                    return [4 /*yield*/, fs.readFile(normalizedPath, 'utf8')];
                case 1:
                    fileContent = _c.sent();
                    log.info("Successfully read file: ".concat(normalizedPath));
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: fileContent
                                }
                            ]
                        }];
                case 2:
                    error_1 = _c.sent();
                    log.error("Error reading file: ".concat(error_1.message));
                    throw new Error("Failed to read file: ".concat(error_1.message));
                case 3: return [2 /*return*/];
            }
        });
    }); },
});
// Define the writeFile tool
server.addTool({
    name: "writeFile",
    description: "Write content to a file",
    parameters: zod_1.z.object({
        filePath: zod_1.z.string().describe("The path to the file to write"),
        content: zod_1.z.string().describe("The content to write to the file"),
    }),
    execute: function (args_1, _a) { return __awaiter(void 0, [args_1, _a], void 0, function (args, _b) {
        var normalizedPath, directory, error_2;
        var log = _b.log;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    log.info("Writing to file at path: ".concat(args.filePath));
                    normalizedPath = path.normalize(args.filePath);
                    directory = path.dirname(normalizedPath);
                    return [4 /*yield*/, fs.mkdir(directory, { recursive: true })];
                case 1:
                    _c.sent();
                    // Write to the file
                    return [4 /*yield*/, fs.writeFile(normalizedPath, args.content)];
                case 2:
                    // Write to the file
                    _c.sent();
                    log.info("Successfully wrote to file: ".concat(normalizedPath));
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Successfully wrote ".concat(args.content.length, " characters to ").concat(normalizedPath)
                                }
                            ]
                        }];
                case 3:
                    error_2 = _c.sent();
                    log.error("Error writing file: ".concat(error_2.message));
                    throw new Error("Failed to write file: ".concat(error_2.message));
                case 4: return [2 /*return*/];
            }
        });
    }); },
});
// Define the listFiles tool
server.addTool({
    name: "listFiles",
    description: "List files in a directory",
    parameters: zod_1.z.object({
        directoryPath: zod_1.z.string().describe("The path to the directory to list files from"),
    }),
    execute: function (args_1, _a) { return __awaiter(void 0, [args_1, _a], void 0, function (args, _b) {
        var normalizedPath_1, files, fileList, error_3;
        var log = _b.log;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    log.info("Listing files in directory: ".concat(args.directoryPath));
                    normalizedPath_1 = path.normalize(args.directoryPath);
                    return [4 /*yield*/, fs.readdir(normalizedPath_1, { withFileTypes: true })];
                case 1:
                    files = _c.sent();
                    fileList = files.map(function (file) { return ({
                        name: file.name,
                        isDirectory: file.isDirectory(),
                        path: path.join(normalizedPath_1, file.name)
                    }); });
                    log.info("Successfully listed ".concat(fileList.length, " files in ").concat(normalizedPath_1));
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify(fileList, null, 2)
                                }
                            ]
                        }];
                case 2:
                    error_3 = _c.sent();
                    log.error("Error listing files: ".concat(error_3.message));
                    throw new Error("Failed to list files: ".concat(error_3.message));
                case 3: return [2 /*return*/];
            }
        });
    }); },
});
// Start the server with stdio transport
server.start({
    transportType: "stdio",
});
console.error("File Server started. Ready to handle MCP requests.");
