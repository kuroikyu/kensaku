# Kensaku

DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables all of DuckDuckGo's bangs to work, but much faster.

```
https://kensaku.kuroikyu.com?q=%s
```

## How is it that much faster?

DuckDuckGo does their redirects server side. Their DNS is...not always great. Result is that it often takes ages.

The original repo [Und*ck](https://github.com/t3dotgg/unduck) solved this by doing all of the work client side. Once you've went to https://kensaku.kuroikyu.com once, the page is cache'd and will never need to be downloaded again. Your device does the redirects, not Kensaku.

The redirect code and the 150 most popular bangs are embedded in the HTML. Searches using those bangs, or the default DuckDuckGo bang, redirect before the homepage loads. Other bangs use a cached file (`public/bangs.txt`).

## Updating bangs

Run `pnpm sync-bangs` to refresh the bang list from DuckDuckGo, then commit the result.

To add or override a bang, edit `scripts/custom-bangs.json` and run `pnpm sync-bangs`.

## Development

Use Node.js 26 or newer. Run `pnpm install`, `pnpm test`, and `pnpm build` to install dependencies, test redirects, and build the site.
