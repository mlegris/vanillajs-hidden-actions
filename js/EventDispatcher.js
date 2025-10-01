class EventDispatcher {

    listeners = {};

    addEventListener(type, listener)
    {
        const listeners = this.listeners;
        if (listeners[type] === undefined)
            listeners[type] = [];

        if (listeners[type].indexOf(listener) === -1)
            listeners[type].push(listener);
    }

    hasEventListener(type, listener)
    {
        const listeners = this.listeners;
        return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
    }

    removeEventListener( type, listener )
    {
        const listeners = this.listeners;
        const listenerArray = listeners[type];

        if (Array.isArray(listenerArray))
        {
            const index = listenerArray.indexOf(listener);

            if (index !== - 1)
                listenerArray.splice(index, 1);
        }
    }

    dispatchEvent(type, event)
    {
        const listeners = this.listeners;
        const listenerArray = listeners[type];

        if (Array.isArray(listenerArray))
        {
            event.target = this;
            event.type = type;

            // Make a copy, in case listeners are removed while iterating.
            const array = listenerArray.slice( 0 );
            for ( let i = 0, l = array.length; i < l; i ++) {
                try {
                    array[i].call(this, event);
                } catch(e) {
                    console.error(e);
                }
            }

            event.target = null;
        }
    }
}

export { EventDispatcher };