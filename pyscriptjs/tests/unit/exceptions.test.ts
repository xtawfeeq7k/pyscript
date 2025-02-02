import { jest } from "@jest/globals"
import { _createAlertBanner, withUserErrorHandler, UserError } from "../../src/exceptions"

describe("Test _createAlertBanner", () => {

  afterEach(() => {
    // Ensure we always have a clean body
    document.body.innerHTML = `<div>Hello World</div>`
  })


  it("error level shouldn't contain close button", async () => {
    _createAlertBanner("Something went wrong!", "error")

    const banner = document.getElementsByClassName("alert-banner")
    const closeButton = document.getElementById("alert-close-button")
    expect(banner.length).toBe(1)
    expect(banner[0].innerHTML).toBe("Something went wrong!")
    expect(closeButton).toBeNull()
  })

  it("warning level should contain close button", async () => {
    _createAlertBanner("This is a warning", "warning")

    const banner = document.getElementsByClassName("alert-banner")
    const closeButton = document.getElementById("alert-close-button")
    expect(banner.length).toBe(1)
    expect(banner[0].innerHTML).toContain("This is a warning")
    expect(closeButton).not.toBeNull()
  })

  it("error level banner should log to console", async () => {
    const logSpy = jest.spyOn(console, "error")

    _createAlertBanner("Something went wrong!")

    expect(logSpy).toHaveBeenCalledWith("Something went wrong!")

  })

  it("warning level banner should log to console", async () => {
    const logSpy = jest.spyOn(console, "warn")

    _createAlertBanner("This warning", "warning")

    expect(logSpy).toHaveBeenCalledWith("This warning")
  })

  it("close button should remove element from page", async () => {
    let banner = document.getElementsByClassName("alert-banner")
    expect(banner.length).toBe(0)

    _createAlertBanner("Warning!", "warning")

    // Just a sanity check
    banner = document.getElementsByClassName("alert-banner")
    expect(banner.length).toBe(1)

    const closeButton = document.getElementById("alert-close-button")
    if(closeButton) {
      closeButton.click()
      // Confirm that clicking the close button, removes the element
      banner = document.getElementsByClassName("alert-banner")
      expect(banner.length).toBe(0)
    } else {
      fail("Unable to find close button on the page, but should exist")
    }

  })

  it("toggling logging off on error alert shouldn't log to console", async () => {
    const errorLogSpy = jest.spyOn(console, "error")

    _createAlertBanner("Test error", "error", false)
    expect(errorLogSpy).not.toHaveBeenCalledWith("Test error")
  })

  it("toggling logging off on warning alert shouldn't log to console", async () => {
    const warnLogSpy = jest.spyOn(console, "warn")
    _createAlertBanner("Test warning", "warning", false)
    expect(warnLogSpy).not.toHaveBeenCalledWith("Test warning")
  })
})


describe("Test withUserErrorHandler", () => {

  afterEach(() => {
    // Ensure we always have a clean body
    document.body.innerHTML = `<div>Hello World</div>`
  })

  it("userError doesn't stop execution", async () => {
    function exception() {
      throw new UserError("Computer says no")
    }

    function func() {
      withUserErrorHandler(exception)
      return "Hello, world"
    }

    const returnValue = func()
    const banners = document.getElementsByClassName("alert-banner")
    expect(banners.length).toBe(1)
    expect(banners[0].innerHTML).toBe("Computer says no")
    expect(returnValue).toBe("Hello, world")
  })

  it("any other exception should stop execution and raise", async () => {
    function exception() {
      throw new Error("Explosions!")
    }

    expect(() => withUserErrorHandler(exception)).toThrow(new Error("Explosions!"))
  })
})
