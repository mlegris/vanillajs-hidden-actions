# vanillajs-hidden-actions
A simple re-usable component that allows you to add hidden actions behind items in a grid or list. The actions are configurable, as well as the icons representing them. 

# USAGE
```javascript
import { Rater } from './js/Rater.js';

const thresholds = {
    20 : { name: "track", imgUrl: "images/track.svg", entity: "track"},
    31 : { name: "artist", imgUrl: "images/artist.svg", entity: "artist"},
    42:  { name: "share", imgUrl: "images/forward.svg", dislike: false, entity: "share" }
};

const contEl = document.querySelector("div#tracks");
const rater = new Rater(contEl, "div.track", 13, 50, thresholds, { applyHeight: true });
rater.addEventListener(Rater.rated, ratingDone);
rater.addEventListener(Rater.rating, ratingStart);

function ratingDone(e)
{
    if(e.entity === "artist" && e.perc < 0)
    {
        const artistId = parseInt(e.el.getAttribute("artistid"));
        const trackEls = document.querySelectorAll("div.track[artistid='"+artistId+"']");
        trackEls.forEach(function(trackEl) {
            trackEl.parentNode.removeChild(trackEl);
        });
    }
    else if(e.entity === "track" && e.perc < 0)
    {
        const trackEl = e.el;
        trackEl.parentNode.removeChild(trackEl);
    }
}

function ratingStart(e)
{
    console.log("rating start", e);
}
```

# CREDITS
I developed it while working on Troove.

[![alt text](https://troove.app/favicon-192x192.png "Troove Logo")](https://troove.app)

# LICENSE
Shield: [![CC BY-NC 4.0][cc-by-nc-shield]][cc-by-nc]

This work is licensed under a
[Creative Commons Attribution-NonCommercial 4.0 International License][cc-by-nc].

[![CC BY-NC 4.0][cc-by-nc-image]][cc-by-nc]

[cc-by-nc]: https://creativecommons.org/licenses/by-nc/4.0/
[cc-by-nc-image]: https://licensebuttons.net/l/by-nc/4.0/88x31.png
[cc-by-nc-shield]: https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg
