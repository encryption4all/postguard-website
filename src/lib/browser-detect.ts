import { browser } from '$app/environment'

function GetBrowserInfo() : { name: string; version: string } {
    let browserName = "Unknown"
    let browserVersion = "Unknown"
    if (browser) {
        let userAgent = window.navigator.userAgent
        let temp
        let match =
            userAgent.match(
                /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
            ) || []
        if (/trident/i.test(match[1])) {
            temp = /\brv[ :]+(\d+)/g.exec(userAgent) || []
            browserName = "IE"
            browserVersion = temp[1] || ""
        } else if (match[1] === "Chrome") {
            temp = userAgent.match(/\b(OPR|Edge)\/(\d+)/)
            if (temp != null) {
                browserName = temp[1].replace("OPR", "Opera")
                browserVersion = temp[2]
            } else {
                browserName = match[1]
                browserVersion = match[2]
            }
        } else {
            match = match[2]
                ? [match[1], match[2]]
                : [navigator.appName, navigator.appVersion, "-?"]
            temp = userAgent.match(/version\/(\d+)/i)
            if (temp != null) {
                match.splice(1, 1, temp[1])
            }
            browserName = match[0]
            browserVersion = match[1]
        }

        return {
            name: browserName,
            version: browserVersion
        }
    }

    return {
        name: browserName,
        version: browserVersion
    }
}

function isMobile(): boolean {
    if (browser || typeof window === "undefined") {
        return false
    }
    // IE11 doesn't have window.navigator, test differently
    // https://stackoverflow.com/questions/21825157/internet-explorer-11-detection
    // @ts-ignore
    if (!!window.MSInputMethodContext && !!document.documentMode) {
        return false
    }

    if (/Android/i.test(window.navigator.userAgent)) {
        return true
    }

    // https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
    // @ts-ignore so MSStream is not flagged as error
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        return true
    }

    // https://stackoverflow.com/questions/57776001/how-to-detect-ipad-pro-as-ipad-using-javascript
    if (
        /Macintosh/.test(navigator.userAgent) &&
        navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2
    ) {
        return true
    }

    // Neither Android nor iOS, assuming desktop
    return false
}

export { GetBrowserInfo, isMobile };