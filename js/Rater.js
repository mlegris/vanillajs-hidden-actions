import {EventDispatcher} from "./EventDispatcher.js";

const rated = "RATED";
const rating = "RATING";

class Rater extends EventDispatcher {

    touchStartX = 0;
    touchStartY = 0;
    elStartX = 0;
    elStartY = 0;
    placeHolderEl = null;
    ratingContEl = null;
    rating = false;
    thresholds = {};
    contEl = null;
    selector = "";

    touchId = null;
    targetEl = null;

    touchStartHandler = null;
    touchMoveHandler = null;
    touchEndHandler = null;
    mouseDownHandler = null;
    mouseUpHandler = null;
    mouseMoveHandler = null;
    clickHandler = null;
    commitThreshold = null;
    mouseDownOnEl = null;

    lastThreshold = null;
    items = [];
    options = {};

    static get rated () { return rated; }
    static get rating() { return rating; }

    constructor(contEl, selector, commitThreshold, hardStop, thresholds, options) {
        super();
        this.thresholds = thresholds;
        this.commitThreshold = commitThreshold || 13;
        this.hardStop = hardStop || 50;
        this.contEl = contEl;
        this.selector = selector;
        this.options = options || {};
        this.touchMoveHandler = this.touchMove.bind(this);
        this.touchEndHandler = this.touchEnd.bind(this);
        this.touchStartHandler = this.touchStart.bind(this);
        this.clickHandler = this.clicked.bind(this);
        this.mouseDownHandler = this.mouseDown.bind(this);
        this.mouseUpHandler = this.mouseUp.bind(this);
        this.mouseMoveHandler = this.mouseMove.bind(this);
        this.init();
    }

    init() {
        const els = document.querySelectorAll(this.selector, this.contEl);
        this.addItems(els);
    }

    addItems(els)
    {
        for (const el of els) {
            if(this.items.indexOf(el) === -1) {
                el.addEventListener("touchstart", this.touchStartHandler);
                el.addEventListener("mousedown", this.mouseDownHandler);
                el.addEventListener("click", this.clickHandler);
                this.items.push(el);
            }
        }
    }

    clear()
    {
        for(const el of this.items)
        {
            el.removeEventListener("touchstart", this.touchStartHandler);
            el.removeEventListener("click", this.clickHandler);
        }
        this.items.length = 0;
    }

    clicked(e)
    {
        document.removeEventListener("mousemove", this.mouseMoveHandler);
        if(this.targetEl === e.currentTarget)
        {
            this.touchId = null;
            this.targetEl = null;
        }
    }

    mouseDown(e)
    {
        const targetEl = e.currentTarget;
        this.mouseDownOnEl = targetEl;
        this.start(targetEl, e.clientX, e.clientY);
        document.addEventListener("mousemove", this.mouseMoveHandler);
    }

    touchStart(e) {
        if (this.touchId !== null)
            return;

        const touch = e.changedTouches[0];
        this.touchId = touch.identifier;
        const targetEl = e.currentTarget;
        this.start(targetEl, touch.clientX, touch.clientY);
        targetEl.addEventListener("touchmove", this.touchMoveHandler);
    }

    start(targetEl, clientX, clientY)
    {
        this.touchStartX = clientX;
        this.touchStartY = clientY;
        this.targetEl = targetEl;
    }

    startRating(targetEl) {
        this.rating = true;
        const contEl = targetEl.parentElement;
        const offset = targetEl.getBoundingClientRect();
        const height = offset.bottom - offset.top;
        const width = offset.right - offset.left;

        // const styles = getComputedStyle(targetEl);
        const ratingContEl = this.ratingContEl = document.createElement("div");
        ratingContEl.style.top = offset.top + "px";
        ratingContEl.style.left = offset.left + "px";
        ratingContEl.style.overflow = "hidden";
        ratingContEl.classList.add("ratingCont");

        const holderEl = this.placeHolderEl = document.createElement("div");
        // holderEl.style.height = height + "px";
        const siblingEl = targetEl.nextSibling;
        contEl.removeChild(targetEl);
        holderEl.classList.add("rating");
        holderEl.classList.add("placeholder");
        if(this.options.applyHeight)
            holderEl.style.height = height + "px";

        const contentEl = el("div", "", "content", holderEl);
        const positiveEl = el("div", "", "positive", contentEl);
        const heartEl = el("img", "", "heart", positiveEl);
        heartEl.src = relative + "images/heart.svg";
        const pWhatEl = el("img", "", "what", positiveEl);

        const negativeEl = el("div", "", "negative", contentEl);
        const xEl = el("img", "", "x", negativeEl);
        xEl.src = relative + "images/x.svg";
        const nWhatEl = el("img", "", "what", negativeEl);

        document.body.appendChild(ratingContEl);
        ratingContEl.appendChild(targetEl);
        targetEl.style.width = "100%";
        targetEl.style.position = "absolute";
        targetEl.style.top = 0;
        targetEl.style.left = 0;
        this.elStartY = offset.top;
        this.elStartX = offset.left;
        ratingContEl.style.top = offset.top + "px";
        ratingContEl.style.left = offset.left + "px";
        ratingContEl.style.width = width + "px";
        ratingContEl.style.height = height + "px";
        ratingContEl.style.zIndex = 10;
        ratingContEl.style.position = "absolute";
        targetEl.setAttribute("rating", "");
        if(siblingEl)
            contEl.insertBefore(holderEl, siblingEl);
        else
            contEl.appendChild(holderEl);
    }

    getTouch(e)
    {
        let touch = null;
        for(const t of e.changedTouches)
        {
            if(t.identifier === this.touchId)
                touch = t;
        }

        return touch;
    }

    mouseUp(e)
    {
        const targetEl = this.mouseDownOnEl;
        this.mouseDownOnEl = null;
        document.removeEventListener("mousemove", this.mouseMoveHandler);
        document.removeEventListener("mouseup", this.mouseUpHandler);
        this.end(targetEl, e.clientX, e.clientY);
    }

    touchEnd(e) {
        const touch = this.getTouch(e);
        if (!touch)
            return false;

        const targetEl = document.querySelector(this.selector + "[rating]");
        document.removeEventListener("touchend", this.touchEndHandler);
        targetEl.removeEventListener("touchmove", this.touchMoveHandler);
        this.end(targetEl, touch.clientX, touch.clientY);
    }

    end(targetEl, clientX, clientY)
    {
        const dX = clientX - this.touchStartX;
        const dY = clientY - this.touchStartY;

        const offset = targetEl.getBoundingClientRect();
        const width = offset.right - offset.left;
        targetEl.style.left = dX + "px";
        const perc = Math.round(dX / width * 100);
        const value = Math.abs(perc);
        const siblingEl = this.placeHolderEl.nextSibling;
        const contEl = this.placeHolderEl.parentElement;
        targetEl.setAttribute("released", "");
        targetEl.style.left = 0;
        this.rating = false;
        const that = this;

        let imgUrl = null;
        let entity = null;
        let count = null;
        [imgUrl, entity, count] = this.getThresholdDetails(perc);

        if(count && "vibrate" in navigator)
        {
            const sequence =[];
            for(let i = 0; i < count; i++)
            {
                sequence.push(200);
                sequence.push(100);
            }

            navigator.vibrate(sequence);
        }

        this.dispatchEvent(rating, { el: targetEl, perc, imgUrl, entity });

        setTimeout(function () {
            document.body.removeChild(that.ratingContEl);
            targetEl.style.position = "";
            targetEl.style.top = "";
            targetEl.style.left = "";
            targetEl.style.width = "";
            targetEl.style.zIndex = "";
            targetEl.style.position = "";
            targetEl.style.borderLeft = "";
            targetEl.style.borderRight = "";
            targetEl.style.backgroundColor = "";
            targetEl.removeAttribute("rating");
            targetEl.removeAttribute("released");
            contEl.removeChild(that.placeHolderEl);
            if(!siblingEl)
                contEl.appendChild(targetEl);
            else
                contEl.insertBefore(targetEl, siblingEl);
            that.touchId = null;
            that.targetEl = null;
            that.dispatchEvent(rated, { el: targetEl, perc: perc, imgUrl, entity });
        }, 500);
    }

    touchMove(e) {
        const touch = this.getTouch(e);
        if (!touch)
            return false;

        const targetEl = e.currentTarget;
        const wasRating = false;
        try {
            this.move(targetEl, touch.clientX, touch.clientY);
            if(this.rating)
                e.preventDefault();
            if(!wasRating && this.rating)
                document.addEventListener("touchend", this.touchEndHandler);
        } catch(error)
        {
            if(error.message === "cancelled")
            {
                document.body.removeEventListener("touchend", this.touchEndHandler);
                targetEl.removeEventListener("touchmove", this.touchMoveHandler);
                this.touchId = null;
            }
            else
                console.error(error);
        }
    }

    mouseMove(e)
    {
        const targetEl = this.mouseDownOnEl;
        const wasRating = this.rating;
        try {
            this.move(targetEl, e.clientX, e.clientY);
            if(this.rating) {
                e.preventDefault();
                if (!wasRating)
                    document.addEventListener("mouseup", this.mouseUpHandler);
            }
        } catch(error)
        {
            if(error.message === "cancelled")
                document.removeEventListener("mousemove", this.mouseMoveHandler);
            else
                console.error(error);
        }
    }

    move(targetEl, clientX, clientY)
    {
        const offset = targetEl.getBoundingClientRect();
        const width = offset.right - offset.left;
        const min = -(width) * this.hardStop/100;
        const max = width * this.hardStop/100;
        const dX = Math.max(min, Math.min(max, clientX - this.touchStartX));
        const dY = clientY - this.touchStartY;
        const aDy = Math.abs(dY);
        const aDx = Math.abs(dX);
        if (!this.rating) {
            if (aDy > aDx && aDy > 15) {
                this.targetEl = null;
                throw new Error("cancelled");
            } else if (aDx > aDy && aDx > 10) {
                this.startRating(targetEl);
                this.move(targetEl, clientX, clientY);
            }
        } else {
            targetEl.style.left = dX + "px";
            const perc = Math.round(dX / width * 100);
            const value = Math.abs(perc);
            const ratingEl = document.querySelector("div#tracks > div.rating");
            const whatEls = document.querySelectorAll("img.what", ratingEl);
            const whatEl = whatEls[perc >= 0 ? 0 : 1];

            let imgUrl = null;
            let entity = null;
            [imgUrl, entity] = this.getThresholdDetails(perc);
            if(imgUrl !== null)
                whatEl.src = imgUrl;

            if(value < this.commitThreshold)
                this.placeHolderEl.style.opacity = value/this.commitThreshold;
            else
                this.placeHolderEl.style.opacity = "";

            if (dX > 0) {
                targetEl.style.borderLeft = "2px solid black";
                targetEl.style.borderRight = "";
            } else {
                targetEl.style.borderRight = "2px solid black";
                targetEl.style.borderLeft = "";
            }
        }
    }

    getThresholdDetails(perc)
    {
        const value = Math.abs(perc);
        const levels = Object.keys(this.thresholds).sort();
        let imgUrl = null;
        let entity = null;
        let newThreshold = 0;
        let count = 0;
        for(const level of levels)
        {
            const threshold = this.thresholds[level];
            if((perc < 0 &&  threshold.hasOwnProperty("dislike") && threshold.dislike === false) ||
                (perc >= 0 && threshold.hasOwnProperty("like") && threshold.like === false))
                continue;
            if(value > level) {
                count++;
                imgUrl = relative + threshold.imgUrl;
                entity = threshold.entity;
                newThreshold = level;
            }
        }

        if(newThreshold !== this.lastThreshold)
        {
            this.lastThreshold = newThreshold;
            if(newThreshold && "vibrate" in navigator)
                navigator.vibrate(200);
        }

        return [imgUrl, entity, count];
    }
}

function el(name, text, className, parentEl)
{
    const element = document.createElement(name);
    if(text)
        element.innerHTML = text;

    if(className)
        element.className = className;

    if(parentEl && parentEl.appendChild != null)
        parentEl.appendChild(element);

    return element;
}

export { Rater };