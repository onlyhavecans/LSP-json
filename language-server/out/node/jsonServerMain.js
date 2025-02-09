"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const runner_1 = require("../utils/runner");
const jsonServer_1 = require("../jsonServer");
const request_light_1 = require("request-light");
const vscode_uri_1 = require("vscode-uri");
const fs = require("fs");
// Create a connection for the server.
const connection = (0, node_1.createConnection)();
console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);
process.on('unhandledRejection', (e) => {
    connection.console.error((0, runner_1.formatError)(`Unhandled exception`, e));
});
function getHTTPRequestService() {
    return {
        getContent(uri, _encoding) {
            const headers = { 'Accept-Encoding': 'gzip, deflate' };
            return (0, request_light_1.xhr)({ url: uri, followRedirects: 5, headers }).then(response => {
                return response.responseText;
            }, (error) => {
                return Promise.reject(error.responseText || (0, request_light_1.getErrorStatusDescription)(error.status) || error.toString());
            });
        }
    };
}
function getFileRequestService() {
    return {
        getContent(location, encoding) {
            return new Promise((c, e) => {
                const uri = vscode_uri_1.URI.parse(location);
                fs.readFile(uri.fsPath, encoding, (err, buf) => {
                    if (err) {
                        return e(err);
                    }
                    c(buf.toString());
                });
            });
        }
    };
}
const runtime = {
    timer: {
        setImmediate(callback, ...args) {
            const handle = setImmediate(callback, ...args);
            return { dispose: () => clearImmediate(handle) };
        },
        setTimeout(callback, ms, ...args) {
            const handle = setTimeout(callback, ms, ...args);
            return { dispose: () => clearTimeout(handle) };
        }
    },
    file: getFileRequestService(),
    http: getHTTPRequestService(),
    configureHttpRequests: request_light_1.configure
};
(0, jsonServer_1.startServer)(connection, runtime);
//# sourceMappingURL=jsonServerMain.js.map
