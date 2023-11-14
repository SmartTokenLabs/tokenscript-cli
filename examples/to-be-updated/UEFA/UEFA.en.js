//<![CDATA[
(function() {
    'use strict'

    function GeneralizedTime(generalizedTime) {
        this.rawData = generalizedTime;
    }

    GeneralizedTime.prototype.getYear = function () {
        return parseInt(this.rawData.substring(0, 4), 10);
    }

    GeneralizedTime.prototype.getMonth = function () {
        return parseInt(this.rawData.substring(4, 6), 10) - 1;
    }

    GeneralizedTime.prototype.getDay = function () {
        return parseInt(this.rawData.substring(6, 8), 10)
    },

    GeneralizedTime.prototype.getHours = function () {
        return parseInt(this.rawData.substring(8, 10), 10)
    },

    GeneralizedTime.prototype.getMinutes = function () {
        var minutes = parseInt(this.rawData.substring(10, 12), 10)
        if (minutes) return minutes
        return 0
    },

    GeneralizedTime.prototype.getSeconds = function () {
        var seconds = parseInt(this.rawData.substring(12, 14), 10)
        if (seconds) return seconds
        return 0
    },

    GeneralizedTime.prototype.getMilliseconds = function () {
        var startIdx
        if (time.indexOf('.') !== -1) {
            startIdx = this.rawData.indexOf('.') + 1
        } else if (time.indexOf(',') !== -1) {
            startIdx = this.rawData.indexOf(',') + 1
        } else {
            return 0
        }

        var stopIdx = time.length - 1
        var fraction = '0' + '.' + time.substring(startIdx, stopIdx)
        var ms = parseFloat(fraction) * 1000
        return ms
    },

    GeneralizedTime.prototype.getTimeZone = function () {
        let time = this.rawData;
        var length = time.length
        var symbolIdx
        if (time.charAt(length - 1 ) === 'Z') return 0
        if (time.indexOf('+') !== -1) {
            symbolIdx = time.indexOf('+')
        } else if (time.indexOf('-') !== -1) {
            symbolIdx = time.indexOf('-')
        } else {
            return NaN
        }

        var minutes = time.substring(symbolIdx + 2)
        var hours = time.substring(symbolIdx + 1, symbolIdx + 2)
        var one = (time.charAt(symbolIdx) === '+') ? 1 : -1

        var intHr = one * parseInt(hours, 10) * 60 * 60 * 1000
        var intMin = one * parseInt(minutes, 10) * 60 * 1000
        var ms = minutes ? intHr + intMin : intHr
        return ms
    }

    if (typeof exports === 'object') {
        module.exports = GeneralizedTime
    } else if (typeof define === 'function' && define.amd) {
        define(GeneralizedTime)
    } else {
        window.GeneralizedTime = GeneralizedTime
    }
}())
class Token {
    constructor(tokenInstance) {
        this.props = tokenInstance
    }

    formatGeneralizedTimeToDate(str) {
        const d = new GeneralizedTime(str)
        return new Date(d.getYear(), d.getMonth(), d.getDay(), d.getHours(), d.getMinutes(), d.getSeconds()).toLocaleDateString()
    }
    formatGeneralizedTimeToTime(str) {
        const d = new GeneralizedTime(str)
        return new Date(d.getYear(), d.getMonth(), d.getDay(), d.getHours(), d.getMinutes(), d.getSeconds()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }

    render() {
        let time;
        let date;
        if (this.props.time == null) {
            time = ""
            date = ""
        } else {
            time = this.formatGeneralizedTimeToTime(this.props.time.generalizedTime)
            date = this.props.time == null ? "": this.formatGeneralizedTimeToDate(this.props.time.generalizedTime)
        }
        let redeemedMessage = "";
        //might not have loaded so only set if actually loaded
        if(this.props.redeemed === "1") {
            redeemedMessage = "(Redeemed)"
        } else if(this.props.redeemed === "0") {
            redeemedMessage = "(Not redeemed)"
        }
        return `<div class="ticket">
        <div class="top-section">
                <div class="left-column">
                    <span class="ticketname">
                        EURO 2020 VIP EVENT TICKET
                    </span>
                    <span class="tbml-city">
                            ${this.props.countryA} - ${this.props.countryB}
                    </span>
                    <span class="tbml-venue">
                            ${this.props.venue}
                    </span>
                    <span class="redeemed">
                            ${redeemedMessage}
                    </span>
                </div>
                <div class="right-column">
                    <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzZweCIgaGVpZ2h0PSIzNnB4IiB2aWV3Qm94PSIwIDAgMzYgMzYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDYxICg4OTU4MSkgLSBodHRwczovL3NrZXRjaC5jb20gLS0+CiAgICA8dGl0bGU+bG9nbzwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPgogICAgICAgIDxwYXRoIGQ9Ik0wLDE4IEMwLDI3Ljk0MDUgOC4wNTk1LDM2IDE4LDM2IEMyNy45NDA1LDM2IDM2LDI3Ljk0MDUgMzYsMTggQzM1Ljk4OTUsOC4wNjQgMjcuOTM2LDAuMDEwNSAxOCwwIEM4LjA1OTUsMCAwLDguMDU5NSAwLDE4IFogTTE4LjY0NSwxMS4yNSBMMTguNjQyLDUuMTkgTDI0LjksMi42ODggQzI1LjYwOTUsMy4wMDkgMjYuMjk2NSwzLjM3OTUgMjYuOTU1LDMuNzk2NSBMMjYuOTczLDMuODA3IEMyNy42MTk1LDQuMjE2NSAyOC4yMzksNC42NzEgMjguODI0LDUuMTY0NSBMMjguODc1LDUuMjA5NSBDMjkuMTM3NSw1LjQzMyAyOS4zOTQsNS42NjQgMjkuNjQxNSw1LjkwNCBMMjkuNzM3NSw1Ljk5NCBDMjkuOTk4NSw2LjI0OSAzMC4yNTA1LDYuNTExNSAzMC40OTM1LDYuNzgxNSBMMzAuNTUzNSw2Ljg1MDUgQzMwLjc2OCw3LjA5MDUgMzAuOTczNSw3LjMzOTUgMzEuMTczLDcuNTkxNSBDMzEuNDQyMzkyMSw3LjkyODA1MzQ4IDMxLjY5ODA5OTksOC4yNzUzMzU3NCAzMS45Mzk1LDguNjMyNSBMMzAuNjk0NSwxMy45MzUgTDI0LjU1NjUsMTUuOTgxIEwxOC42NDM1LDExLjI1MTUgTDE4LjY0NSwxMS4yNSBaIE01LjMwNywxMy45MzggTDQuMDU5LDguNjM1NSBDNC4yNTg1LDguMzQxNSA0LjQ2NTUsOC4wNTY1IDQuNjgxNSw3Ljc3NzUgTDQuODI0LDcuNTk3NSBDNS4wMjA1LDcuMzQ3IDUuMjI2LDcuMTAyNSA1LjQzNiw2Ljg2MjUgQzUuNjk5NDAwNjUsNi41NjUwODE1OCA1Ljk3MzU4MzY2LDYuMjc3Mzg5NTYgNi4yNTgsNiBMNi4yNTgsNi4wMDE1IEw2LjM0OCw1LjkxNDUgQzYuNTk1NSw1LjY3NzUgNi44NDksNS40NDY1IDcuMTEsNS4yMjQ1IEw3LjE3LDUuMTczNSBDNy43NTA1LDQuNjgzIDguMzYyNSw0LjIzMTUgOS4wMDQ1LDMuODIzNSBMOS4wMjcsMy44MDg1IEM5LjY4MjUsMy4zOTMgMTAuMzY1LDMuMDIyNSAxMS4wNzE1LDIuNzAxNSBMMTcuMzU2NSw1LjE5MTUgTDE3LjM1NjUsMTEuMjUgTDExLjQ0NjUsMTUuOTc5NSBMNS4zMDcsMTMuOTM1IEw1LjMwNywxMy45MzggWiBNMjMuMTk3NSwyNC4yNzc1IEwyNC45NjQ1LDE3LjIwMzUgTDMxLjA2MDUsMTUuMTcyNSBMMzQuNzIzNSwxOS41Njc1IEMzNC42NTksMjAuMjUxNSAzNC41NTQsMjAuOTMxIDM0LjQwNywyMS42MDE1IEMzNC4zOTk1LDIxLjYzMTUgMzQuMzkyLDIxLjY1ODUgMzQuMzg3NSwyMS42ODcgQzM0LjMyMDIyNTUsMjEuOTgyNDIwMiAzNC4yNDUxOTk2LDIyLjI3NjAyMTUgMzQuMTYyNSwyMi41Njc1IEwzNC4xMzEsMjIuNjgxNSBDMzQuMDQxLDIyLjk5MDUgMzMuOTQzNSwyMy4yOTY1IDMzLjgzNywyMy41OTggTDMzLjgzNywyMy42MDQgQzMzLjYxMiwyNC4yMzg1IDMzLjM0OCwyNC44NTk1IDMzLjA0NjUsMjUuNDY0IEwzMy4wNDIsMjUuNDczIEMzMi44OTgsMjUuNzU5NSAzMi43NDY1LDI2LjA0MyAzMi41ODc1LDI2LjMxOSBMMzIuNTQ4NSwyNi4zODY1IEMzMi4zODg4NjY2LDI2LjY2NTg1NDggMzIuMjIwMjc5MywyNi45Mzk5OTY4IDMyLjA0MywyNy4yMDg1IEwyNi4xMjQsMjguMTQxNSBMMjMuMTk3NSwyNC4yNzc1IEwyMy4xOTc1LDI0LjI3NzUgWiBNMy45NiwyNy4yMDcgQzMuNzg0NSwyNi45MzcgMy42MTUsMjYuNjY0IDMuNDU0NSwyNi4zODUgTDMuNDE1NSwyNi4zMTc1IEMzLjI1NTMzNjM4LDI2LjAzOTczMjQgMy4xMDM3NjQ1NSwyNS43NTcwOTg0IDIuOTYxLDI1LjQ3IEwyLjk1NjUsMjUuNDYxIEMyLjY1NTc4MDE3LDI0Ljg1NzQ4NjUgMi4zOTE3OTkyMSwyNC4yMzYzNTQ4IDIuMTY2LDIzLjYwMSBMMi4xNjYsMjMuNTk1IEMyLjA1OTUsMjMuMjk1IDEuOTYyLDIyLjk4OSAxLjg3MiwyMi42OCBMMS44MzksMjIuNTY2IEMxLjc1NjUsMjIuMjc1IDEuNjgzLDIxLjk4MSAxLjYxNTUsMjEuNjg0IEwxLjU5NiwyMS42IEMxLjQ0OSwyMC45Mjk1IDEuMzQ0LDIwLjI1IDEuMjgxLDE5LjU2NzUgTDQuOTQyNSwxNS4xNzI1IEwxMS4wMzcsMTcuMjAzNSBMMTIuODA3LDI0LjI3OSBMOS45LDI4LjE0NiBMMy45NiwyNy4yMDcgTDMuOTYsMjcuMjA3IFogTTE3LjExNSwzNC43NzYgQzE3LjA3OSwzNC43NzYgMTcuMDQ2LDM0Ljc3IDE3LjAxLDM0Ljc2ODUgQzE2Ljc0OSwzNC43NTM1IDE2LjQ4OTUsMzQuNzM0IDE2LjIzLDM0LjcwODUgTDE2LjIsMzQuNzAyNSBDMTUuNjMxODQ1MiwzNC42NDA4MTA2IDE1LjA2NzEzNzUsMzQuNTUwNjk3NiAxNC41MDgsMzQuNDMyNSBMMTAuOTU5LDI4Ljg3NjUgTDEzLjgxOTUsMjUuMDYyIEwyMi4xODA1LDI1LjA2MiBMMjUuMDg3NSwyOC45MDIgTDIxLjk5NiwzNC4zMTcgQzIxLjY5NiwzNC4zOTA1IDIxLjM4NywzNC40NTM1IDIxLjA4MSwzNC41MTIgTDIwLjk0OSwzNC41MzYgQzIwLjY4NjEzODYsMzQuNTgzMTg0IDIwLjQyMjA0MDYsMzQuNjIzMTk4OCAyMC4xNTcsMzQuNjU2IEwxOS45NDQsMzQuNjgzIEMxOS42OTgsMzQuNzExNSAxOS40NDksMzQuNzMyNSAxOS4yLDM0Ljc1MDUgQzE5LjEyMDUsMzQuNzU2NSAxOS4wNDQsMzQuNzY1NSAxOC45NjQ1LDM0Ljc2ODUgQzE4LjM0ODYxODQsMzQuODA1MzY3OSAxNy43MzExNjAzLDM0LjgwNzg3MTggMTcuMTE1LDM0Ljc3NiBMMTcuMTE1LDM0Ljc3NiBaIiBpZD0icGF0aC0xIj48L3BhdGg+CiAgICA8L2RlZnM+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0ibG9nbyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEyLjAwMDAwMCwgLTEyLjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0iR3JvdXAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyLjAwMDAwMCwgMTIuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8ZyBpZD0iQ2xpcHBlZCI+CiAgICAgICAgICAgICAgICAgICAgPG1hc2sgaWQ9Im1hc2stMiIgZmlsbD0id2hpdGUiPgogICAgICAgICAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9IiNwYXRoLTEiPjwvdXNlPgogICAgICAgICAgICAgICAgICAgIDwvbWFzaz4KICAgICAgICAgICAgICAgICAgICA8ZyBpZD0iYSI+PC9nPgogICAgICAgICAgICAgICAgICAgIDxwb2x5Z29uIGlkPSJQYXRoIiBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9Im5vbnplcm8iIG1hc2s9InVybCgjbWFzay0yKSIgcG9pbnRzPSItMC42NTI1IDM2LjY1MjUgMzYuNjUyNSAzNi42NTI1IDM2LjY1MjUgLTAuNjUyNSAtMC42NTI1IC0wLjY1MjUiPjwvcG9seWdvbj4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+" class="uefa-logo" />
                    <span class="tbml-match">
                        M${this.props.match}
                    </span>
                </div>
            </div>
            <hr class="white-line">
            <div class="ticket-bottom-section">
                <div class="left-col">
                    <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTRweCIgaGVpZ2h0PSIxNHB4IiB2aWV3Qm94PSIwIDAgMTQgMTQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDYwICg4ODEwMykgLSBodHRwczovL3NrZXRjaC5jb20gLS0+CiAgICA8dGl0bGU+aWNfc2NoZWR1bGVfYmxhY2tfMjRweDwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxnIGlkPSJTeW1ib2xzIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iQW5kcm9pZC9DYXJkcy9UaWNrZXRzXzUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zMi4wMDAwMDAsIC0xNTcuMDAwMDAwKSI+CiAgICAgICAgICAgIDxnIGlkPSJHcm91cC0zIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4LjAwMDAwMCwgMC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIGlkPSJpY19zY2hlZHVsZV9ibGFja18yNHB4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMy4wMDAwMDAsIDE1Ni4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICA8ZyBpZD0iR3JvdXAiPgogICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNy45OTMzMzMzMywxLjMzMzMzMzMzIEM0LjMxMzMzMzMzLDEuMzMzMzMzMzMgMS4zMzMzMzMzMyw0LjMyIDEuMzMzMzMzMzMsOCBDMS4zMzMzMzMzMywxMS42OCA0LjMxMzMzMzMzLDE0LjY2NjY2NjcgNy45OTMzMzMzMywxNC42NjY2NjY3IEMxMS42OCwxNC42NjY2NjY3IDE0LjY2NjY2NjcsMTEuNjggMTQuNjY2NjY2Nyw4IEMxNC42NjY2NjY3LDQuMzIgMTEuNjgsMS4zMzMzMzMzMyA3Ljk5MzMzMzMzLDEuMzMzMzMzMzMgWiBNOCwxMy4zMzMzMzMzIEM1LjA1MzMzMzMzLDEzLjMzMzMzMzMgMi42NjY2NjY2NywxMC45NDY2NjY3IDIuNjY2NjY2NjcsOCBDMi42NjY2NjY2Nyw1LjA1MzMzMzMzIDUuMDUzMzMzMzMsMi42NjY2NjY2NyA4LDIuNjY2NjY2NjcgQzEwLjk0NjY2NjcsMi42NjY2NjY2NyAxMy4zMzMzMzMzLDUuMDUzMzMzMzMgMTMuMzMzMzMzMyw4IEMxMy4zMzMzMzMzLDEwLjk0NjY2NjcgMTAuOTQ2NjY2NywxMy4zMzMzMzMzIDgsMTMuMzMzMzMzMyBaIiBpZD0iU2hhcGUiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgICAgICA8cG9seWdvbiBpZD0iU2hhcGUiIHBvaW50cz0iMCAwIDE2IDAgMTYgMTYgMCAxNiI+PC9wb2x5Z29uPgogICAgICAgICAgICAgICAgICAgICAgICA8cG9seWdvbiBpZD0iU2hhcGUiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyIgcG9pbnRzPSI4LjMzMzMzMzMzIDQuNjY2NjY2NjcgNy4zMzMzMzMzMyA0LjY2NjY2NjY3IDcuMzMzMzMzMzMgOC42NjY2NjY2NyAxMC44MzMzMzMzIDEwLjc2NjY2NjcgMTEuMzMzMzMzMyA5Ljk0NjY2NjY3IDguMzMzMzMzMzMgOC4xNjY2NjY2NyI+PC9wb2x5Z29uPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+" class="data-icon"/>
                    <span class="date">
                            ${date}
                    </span>
                </div>
                <div class="right-col">
                    <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIxMnB4IiBoZWlnaHQ9IjExcHgiIHZpZXdCb3g9IjAgMCAxMiAxMSIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4gICAgICAgIDx0aXRsZT5pY19zdGFyX3JhdGVfYmxhY2tfMThweDwvdGl0bGU+ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPiAgICA8ZyBpZD0iU3ltYm9scyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+ICAgICAgICA8ZyBpZD0iQW5kcm9pZC9DYXJkcy9UaWNrZXRzXzUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMzkuMDAwMDAwLCAtMTU4LjAwMDAwMCkiPiAgICAgICAgICAgIDxnIGlkPSJHcm91cC0zIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4LjAwMDAwMCwgMC4wMDAwMDApIj4gICAgICAgICAgICAgICAgPGcgaWQ9ImljX3N0YXJfcmF0ZV9ibGFja18xOHB4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMjkuMDAwMDAwLCAxNTYuMDAwMDAwKSI+ICAgICAgICAgICAgICAgICAgICA8ZyBpZD0iR3JvdXAiPiAgICAgICAgICAgICAgICAgICAgICAgIDxwb2x5Z29uIGlkPSJTaGFwZSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHBvaW50cz0iOCAxMC4wNDQ0NDQ0IDExLjI5Nzc3NzggMTIuNDQ0NDQ0NCAxMC4wMzU1NTU2IDguNTY4ODg4ODkgMTMuMzMzMzMzMyA2LjIyMjIyMjIyIDkuMjg4ODg4ODkgNi4yMjIyMjIyMiA4IDIuMjIyMjIyMjIgNi43MTExMTExMSA2LjIyMjIyMjIyIDIuNjY2NjY2NjcgNi4yMjIyMjIyMiA1Ljk2NDQ0NDQ0IDguNTY4ODg4ODkgNC43MDIyMjIyMiAxMi40NDQ0NDQ0Ij48L3BvbHlnb24+ICAgICAgICAgICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9IlNoYXBlIiBwb2ludHM9IjAgMCAxNiAwIDE2IDE2IDAgMTYiPjwvcG9seWdvbj4gICAgICAgICAgICAgICAgICAgIDwvZz4gICAgICAgICAgICAgICAgPC9nPiAgICAgICAgICAgIDwvZz4gICAgICAgIDwvZz4gICAgPC9nPjwvc3ZnPg==" class="data-icon" />
                    <span class="tbml-category">
                        ${this.props.category}
                    </span>
                </div>
            </div>
</div>`;
    }
}

web3.tokens.dataChanged = (oldTokens, updatedTokens, tokenCardId) => {
    const currentTokenInstance = updatedTokens.currentInstance;
    document.getElementById(tokenCardId).innerHTML = new Token(currentTokenInstance).render();
};
//]]>
