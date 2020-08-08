"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = convertHourToMinute;

function convertHourToMinute(time) {
  const [hour, minutes] = time.split(':').map(Number);
  const timeInMinutes = hour * 60 + minutes;
  return timeInMinutes;
}