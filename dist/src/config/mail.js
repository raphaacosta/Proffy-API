"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = __importStar(require("nodemailer"));
const configs_1 = __importDefault(require("./configs"));
class Mail {
    constructor(to, subject, message) {
        this.to = to;
        this.subject = subject;
        this.message = message;
    }
    sendMail() {
        let mailOptions = {
            from: "rafa.costa0@hotmail.com",
            to: this.to,
            subject: this.subject,
            html: this.message
        };
        const transporter = nodemailer.createTransport({
            host: configs_1.default.host,
            port: configs_1.default.port,
            secure: false,
            auth: {
                user: configs_1.default.user,
                pass: configs_1.default.password
            },
            tls: { rejectUnauthorized: false }
        });
        console.log(mailOptions);
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return error;
            }
            else {
                return console.log("E-mail enviado com sucesso!");
            }
        });
    }
}
exports.default = new Mail;
