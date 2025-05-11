Remember -- claude uses `node.js`. you cannot run `killall node`

avoid executing commands like `npm run dev` without adding an `&` to background them, and ensuring to kill/clean them up after testing. these commands do not execute by themselves otherwise.

when doing headless browser testing, if you can scrape the console, capture the information for any errors.

Never check in secrets. Never git commit hard coded base64-encoded values.
