
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty$1() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const isUndefined = value => typeof value === "undefined";

    const isFunction = value => typeof value === "function";

    const isNumber = value => typeof value === "number";

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
    	return (
    		!event.defaultPrevented &&
    		event.button === 0 &&
    		!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
    	);
    }

    function createCounter() {
    	let i = 0;
    	/**
    	 * Returns an id and increments the internal state
    	 * @returns {number}
    	 */
    	return () => i++;
    }

    /**
     * Create a globally unique id
     *
     * @returns {string} An id
     */
    function createGlobalId() {
    	return Math.random().toString(36).substring(2);
    }

    const isSSR = typeof window === "undefined";

    function addListener(target, type, handler) {
    	target.addEventListener(type, handler);
    	return () => target.removeEventListener(type, handler);
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /*
     * Adapted from https://github.com/EmilTholin/svelte-routing
     *
     * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
     */

    const createKey = ctxName => `@@svnav-ctx__${ctxName}`;

    // Use strings instead of objects, so different versions of
    // svelte-navigator can potentially still work together
    const LOCATION = createKey("LOCATION");
    const ROUTER = createKey("ROUTER");
    const ROUTE = createKey("ROUTE");
    const ROUTE_PARAMS = createKey("ROUTE_PARAMS");
    const FOCUS_ELEM = createKey("FOCUS_ELEM");

    const paramRegex = /^:(.+)/;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    const startsWith = (string, search) =>
    	string.substr(0, search.length) === search;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    const isRootSegment = segment => segment === "";

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    const isDynamic = segment => paramRegex.test(segment);

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    const isSplat = segment => segment[0] === "*";

    /**
     * Strip potention splat and splatname of the end of a path
     * @param {string} str
     * @return {string}
     */
    const stripSplat = str => str.replace(/\*.*$/, "");

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    const stripSlashes = str => str.replace(/(^\/+|\/+$)/g, "");

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri, filterFalsy = false) {
    	const segments = stripSlashes(uri).split("/");
    	return filterFalsy ? segments.filter(Boolean) : segments;
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    const addQuery = (pathname, query) =>
    	pathname + (query ? `?${query}` : "");

    /**
     * Normalizes a basepath
     *
     * @param {string} path
     * @returns {string}
     *
     * @example
     * normalizePath("base/path/") // -> "/base/path"
     */
    const normalizePath = path => `/${stripSlashes(path)}`;

    /**
     * Joins and normalizes multiple path fragments
     *
     * @param {...string} pathFragments
     * @returns {string}
     */
    function join(...pathFragments) {
    	const joinFragment = fragment => segmentize(fragment, true).join("/");
    	const joinedSegments = pathFragments.map(joinFragment).join("/");
    	return normalizePath(joinedSegments);
    }

    // We start from 1 here, so we can check if an origin id has been passed
    // by using `originId || <fallback>`
    const LINK_ID = 1;
    const ROUTE_ID = 2;
    const ROUTER_ID = 3;
    const USE_FOCUS_ID = 4;
    const USE_LOCATION_ID = 5;
    const USE_MATCH_ID = 6;
    const USE_NAVIGATE_ID = 7;
    const USE_PARAMS_ID = 8;
    const USE_RESOLVABLE_ID = 9;
    const USE_RESOLVE_ID = 10;
    const NAVIGATE_ID = 11;

    const labels = {
    	[LINK_ID]: "Link",
    	[ROUTE_ID]: "Route",
    	[ROUTER_ID]: "Router",
    	[USE_FOCUS_ID]: "useFocus",
    	[USE_LOCATION_ID]: "useLocation",
    	[USE_MATCH_ID]: "useMatch",
    	[USE_NAVIGATE_ID]: "useNavigate",
    	[USE_PARAMS_ID]: "useParams",
    	[USE_RESOLVABLE_ID]: "useResolvable",
    	[USE_RESOLVE_ID]: "useResolve",
    	[NAVIGATE_ID]: "navigate",
    };

    const createLabel = labelId => labels[labelId];

    function createIdentifier(labelId, props) {
    	let attr;
    	if (labelId === ROUTE_ID) {
    		attr = props.path ? `path="${props.path}"` : "default";
    	} else if (labelId === LINK_ID) {
    		attr = `to="${props.to}"`;
    	} else if (labelId === ROUTER_ID) {
    		attr = `basepath="${props.basepath || ""}"`;
    	}
    	return `<${createLabel(labelId)} ${attr || ""} />`;
    }

    function createMessage(labelId, message, props, originId) {
    	const origin = props && createIdentifier(originId || labelId, props);
    	const originMsg = origin ? `\n\nOccurred in: ${origin}` : "";
    	const label = createLabel(labelId);
    	const msg = isFunction(message) ? message(label) : message;
    	return `<${label}> ${msg}${originMsg}`;
    }

    const createMessageHandler = handler => (...args) =>
    	handler(createMessage(...args));

    const fail = createMessageHandler(message => {
    	throw new Error(message);
    });

    // eslint-disable-next-line no-console
    const warn = createMessageHandler(console.warn);

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
    	const score = route.default
    		? 0
    		: segmentize(route.fullPath).reduce((acc, segment) => {
    				let nextScore = acc;
    				nextScore += SEGMENT_POINTS;

    				if (isRootSegment(segment)) {
    					nextScore += ROOT_POINTS;
    				} else if (isDynamic(segment)) {
    					nextScore += DYNAMIC_POINTS;
    				} else if (isSplat(segment)) {
    					nextScore -= SEGMENT_POINTS + SPLAT_PENALTY;
    				} else {
    					nextScore += STATIC_POINTS;
    				}

    				return nextScore;
    		  }, 0);

    	return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
    	return (
    		routes
    			.map(rankRoute)
    			// If two routes have the exact same score, we go by index instead
    			.sort((a, b) => {
    				if (a.score < b.score) {
    					return 1;
    				}
    				if (a.score > b.score) {
    					return -1;
    				}
    				return a.index - b.index;
    			})
    	);
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { fullPath, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick$1(routes, uri) {
    	let bestMatch;
    	let defaultMatch;

    	const [uriPathname] = uri.split("?");
    	const uriSegments = segmentize(uriPathname);
    	const isRootUri = uriSegments[0] === "";
    	const ranked = rankRoutes(routes);

    	for (let i = 0, l = ranked.length; i < l; i++) {
    		const { route } = ranked[i];
    		let missed = false;
    		const params = {};

    		// eslint-disable-next-line no-shadow
    		const createMatch = uri => ({ ...route, params, uri });

    		if (route.default) {
    			defaultMatch = createMatch(uri);
    			continue;
    		}

    		const routeSegments = segmentize(route.fullPath);
    		const max = Math.max(uriSegments.length, routeSegments.length);
    		let index = 0;

    		for (; index < max; index++) {
    			const routeSegment = routeSegments[index];
    			const uriSegment = uriSegments[index];

    			if (!isUndefined(routeSegment) && isSplat(routeSegment)) {
    				// Hit a splat, just grab the rest, and return a match
    				// uri:   /files/documents/work
    				// route: /files/* or /files/*splatname
    				const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

    				params[splatName] = uriSegments
    					.slice(index)
    					.map(decodeURIComponent)
    					.join("/");
    				break;
    			}

    			if (isUndefined(uriSegment)) {
    				// URI is shorter than the route, no match
    				// uri:   /users
    				// route: /users/:userId
    				missed = true;
    				break;
    			}

    			const dynamicMatch = paramRegex.exec(routeSegment);

    			if (dynamicMatch && !isRootUri) {
    				const value = decodeURIComponent(uriSegment);
    				params[dynamicMatch[1]] = value;
    			} else if (routeSegment !== uriSegment) {
    				// Current segments don't match, not dynamic, not splat, so no match
    				// uri:   /users/123/settings
    				// route: /users/:id/profile
    				missed = true;
    				break;
    			}
    		}

    		if (!missed) {
    			bestMatch = createMatch(join(...uriSegments.slice(0, index)));
    			break;
    		}
    	}

    	return bestMatch || defaultMatch || null;
    }

    /**
     * Check if the `route.fullPath` matches the `uri`.
     * @param {Object} route
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
    	return pick$1([route], uri);
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
    	// /foo/bar, /baz/qux => /foo/bar
    	if (startsWith(to, "/")) {
    		return to;
    	}

    	const [toPathname, toQuery] = to.split("?");
    	const [basePathname] = base.split("?");
    	const toSegments = segmentize(toPathname);
    	const baseSegments = segmentize(basePathname);

    	// ?a=b, /users?b=c => /users?a=b
    	if (toSegments[0] === "") {
    		return addQuery(basePathname, toQuery);
    	}

    	// profile, /users/789 => /users/789/profile
    	if (!startsWith(toSegments[0], ".")) {
    		const pathname = baseSegments.concat(toSegments).join("/");
    		return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
    	}

    	// ./       , /users/123 => /users/123
    	// ../      , /users/123 => /users
    	// ../..    , /users/123 => /
    	// ../../one, /a/b/c/d   => /a/b/one
    	// .././one , /a/b/c/d   => /a/b/c/one
    	const allSegments = baseSegments.concat(toSegments);
    	const segments = [];

    	allSegments.forEach(segment => {
    		if (segment === "..") {
    			segments.pop();
    		} else if (segment !== ".") {
    			segments.push(segment);
    		}
    	});

    	return addQuery(`/${segments.join("/")}`, toQuery);
    }

    /**
     * Normalizes a location for consumption by `Route` children and the `Router`.
     * It removes the apps basepath from the pathname
     * and sets default values for `search` and `hash` properties.
     *
     * @param {Object} location The current global location supplied by the history component
     * @param {string} basepath The applications basepath (i.e. when serving from a subdirectory)
     *
     * @returns The normalized location
     */
    function normalizeLocation(location, basepath) {
    	const { pathname, hash = "", search = "", state } = location;
    	const baseSegments = segmentize(basepath, true);
    	const pathSegments = segmentize(pathname, true);
    	while (baseSegments.length) {
    		if (baseSegments[0] !== pathSegments[0]) {
    			fail(
    				ROUTER_ID,
    				`Invalid state: All locations must begin with the basepath "${basepath}", found "${pathname}"`,
    			);
    		}
    		baseSegments.shift();
    		pathSegments.shift();
    	}
    	return {
    		pathname: join(...pathSegments),
    		hash,
    		search,
    		state,
    	};
    }

    const normalizeUrlFragment = frag => (frag.length === 1 ? "" : frag);

    /**
     * Creates a location object from an url.
     * It is used to create a location from the url prop used in SSR
     *
     * @param {string} url The url string (e.g. "/path/to/somewhere")
     *
     * @returns {{ pathname: string; search: string; hash: string }} The location
     */
    function createLocation(url) {
    	const searchIndex = url.indexOf("?");
    	const hashIndex = url.indexOf("#");
    	const hasSearchIndex = searchIndex !== -1;
    	const hasHashIndex = hashIndex !== -1;
    	const hash = hasHashIndex ? normalizeUrlFragment(url.substr(hashIndex)) : "";
    	const pathnameAndSearch = hasHashIndex ? url.substr(0, hashIndex) : url;
    	const search = hasSearchIndex
    		? normalizeUrlFragment(pathnameAndSearch.substr(searchIndex))
    		: "";
    	const pathname = hasSearchIndex
    		? pathnameAndSearch.substr(0, searchIndex)
    		: pathnameAndSearch;
    	return { pathname, search, hash };
    }

    /**
     * Resolves a link relative to the parent Route and the Routers basepath.
     *
     * @param {string} path The given path, that will be resolved
     * @param {string} routeBase The current Routes base path
     * @param {string} appBase The basepath of the app. Used, when serving from a subdirectory
     * @returns {string} The resolved path
     *
     * @example
     * resolveLink("relative", "/routeBase", "/") // -> "/routeBase/relative"
     * resolveLink("/absolute", "/routeBase", "/") // -> "/absolute"
     * resolveLink("relative", "/routeBase", "/base") // -> "/base/routeBase/relative"
     * resolveLink("/absolute", "/routeBase", "/base") // -> "/base/absolute"
     */
    function resolveLink(path, routeBase, appBase) {
    	return join(appBase, resolve(path, routeBase));
    }

    /**
     * Get the uri for a Route, by matching it against the current location.
     *
     * @param {string} routePath The Routes resolved path
     * @param {string} pathname The current locations pathname
     */
    function extractBaseUri(routePath, pathname) {
    	const fullPath = normalizePath(stripSplat(routePath));
    	const baseSegments = segmentize(fullPath, true);
    	const pathSegments = segmentize(pathname, true).slice(0, baseSegments.length);
    	const routeMatch = match({ fullPath }, join(...pathSegments));
    	return routeMatch && routeMatch.uri;
    }

    /*
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const POP = "POP";
    const PUSH = "PUSH";
    const REPLACE = "REPLACE";

    function getLocation(source) {
    	return {
    		...source.location,
    		pathname: encodeURI(decodeURI(source.location.pathname)),
    		state: source.history.state,
    		_key: (source.history.state && source.history.state._key) || "initial",
    	};
    }

    function createHistory(source) {
    	let listeners = [];
    	let location = getLocation(source);
    	let action = POP;

    	const notifyListeners = (listenerFns = listeners) =>
    		listenerFns.forEach(listener => listener({ location, action }));

    	return {
    		get location() {
    			return location;
    		},
    		listen(listener) {
    			listeners.push(listener);

    			const popstateListener = () => {
    				location = getLocation(source);
    				action = POP;
    				notifyListeners([listener]);
    			};

    			// Call listener when it is registered
    			notifyListeners([listener]);

    			const unlisten = addListener(source, "popstate", popstateListener);
    			return () => {
    				unlisten();
    				listeners = listeners.filter(fn => fn !== listener);
    			};
    		},
    		/**
    		 * Navigate to a new absolute route.
    		 *
    		 * @param {string|number} to The path to navigate to.
    		 *
    		 * If `to` is a number we will navigate to the stack entry index + `to`
    		 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
    		 * @param {Object} options
    		 * @param {*} [options.state] The state will be accessible through `location.state`
    		 * @param {boolean} [options.replace=false] Replace the current entry in the history
    		 * stack, instead of pushing on a new one
    		 */
    		navigate(to, options) {
    			const { state = {}, replace = false } = options || {};
    			action = replace ? REPLACE : PUSH;
    			if (isNumber(to)) {
    				if (options) {
    					warn(
    						NAVIGATE_ID,
    						"Navigation options (state or replace) are not supported, " +
    							"when passing a number as the first argument to navigate. " +
    							"They are ignored.",
    					);
    				}
    				action = POP;
    				source.history.go(to);
    			} else {
    				const keyedState = { ...state, _key: createGlobalId() };
    				// try...catch iOS Safari limits to 100 pushState calls
    				try {
    					source.history[replace ? "replaceState" : "pushState"](
    						keyedState,
    						"",
    						to,
    					);
    				} catch (e) {
    					source.location[replace ? "replace" : "assign"](to);
    				}
    			}

    			location = getLocation(source);
    			notifyListeners();
    		},
    	};
    }

    function createStackFrame(state, uri) {
    	return { ...createLocation(uri), state };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
    	let index = 0;
    	let stack = [createStackFrame(null, initialPathname)];

    	return {
    		// This is just for testing...
    		get entries() {
    			return stack;
    		},
    		get location() {
    			return stack[index];
    		},
    		addEventListener() {},
    		removeEventListener() {},
    		history: {
    			get state() {
    				return stack[index].state;
    			},
    			pushState(state, title, uri) {
    				index++;
    				// Throw away anything in the stack with an index greater than the current index.
    				// This happens, when we go back using `go(-n)`. The index is now less than `stack.length`.
    				// If we call `go(+n)` the stack entries with an index greater than the current index can
    				// be reused.
    				// However, if we navigate to a path, instead of a number, we want to create a new branch
    				// of navigation.
    				stack = stack.slice(0, index);
    				stack.push(createStackFrame(state, uri));
    			},
    			replaceState(state, title, uri) {
    				stack[index] = createStackFrame(state, uri);
    			},
    			go(to) {
    				const newIndex = index + to;
    				if (newIndex < 0 || newIndex > stack.length - 1) {
    					return;
    				}
    				index = newIndex;
    			},
    		},
    	};
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = !!(
    	!isSSR &&
    	window.document &&
    	window.document.createElement
    );
    // Use memory history in iframes (for example in Svelte REPL)
    const isEmbeddedPage = !isSSR && window.location.origin === "null";
    const globalHistory = createHistory(
    	canUseDOM && !isEmbeddedPage ? window : createMemorySource(),
    );

    // We need to keep the focus candidate in a separate file, so svelte does
    // not update, when we mutate it.
    // Also, we need a single global reference, because taking focus needs to
    // work globally, even if we have multiple top level routers
    // eslint-disable-next-line import/no-mutable-exports
    let focusCandidate = null;

    // eslint-disable-next-line import/no-mutable-exports
    let initialNavigation = true;

    /**
     * Check if RouterA is above RouterB in the document
     * @param {number} routerIdA The first Routers id
     * @param {number} routerIdB The second Routers id
     */
    function isAbove(routerIdA, routerIdB) {
    	const routerMarkers = document.querySelectorAll("[data-svnav-router]");
    	for (let i = 0; i < routerMarkers.length; i++) {
    		const node = routerMarkers[i];
    		const currentId = Number(node.dataset.svnavRouter);
    		if (currentId === routerIdA) return true;
    		if (currentId === routerIdB) return false;
    	}
    	return false;
    }

    /**
     * Check if a Route candidate is the best choice to move focus to,
     * and store the best match.
     * @param {{
         level: number;
         routerId: number;
         route: {
           id: number;
           focusElement: import("svelte/store").Readable<Promise<Element>|null>;
         }
       }} item A Route candidate, that updated and is visible after a navigation
     */
    function pushFocusCandidate(item) {
    	if (
    		// Best candidate if it's the only candidate...
    		!focusCandidate ||
    		// Route is nested deeper, than previous candidate
    		// -> Route change was triggered in the deepest affected
    		// Route, so that's were focus should move to
    		item.level > focusCandidate.level ||
    		// If the level is identical, we want to focus the first Route in the document,
    		// so we pick the first Router lookin from page top to page bottom.
    		(item.level === focusCandidate.level &&
    			isAbove(item.routerId, focusCandidate.routerId))
    	) {
    		focusCandidate = item;
    	}
    }

    /**
     * Reset the focus candidate.
     */
    function clearFocusCandidate() {
    	focusCandidate = null;
    }

    function initialNavigationOccurred() {
    	initialNavigation = false;
    }

    /*
     * `focus` Adapted from https://github.com/oaf-project/oaf-side-effects/blob/master/src/index.ts
     *
     * https://github.com/oaf-project/oaf-side-effects/blob/master/LICENSE
     */
    function focus(elem) {
    	if (!elem) return false;
    	const TABINDEX = "tabindex";
    	try {
    		if (!elem.hasAttribute(TABINDEX)) {
    			elem.setAttribute(TABINDEX, "-1");
    			let unlisten;
    			// We remove tabindex after blur to avoid weird browser behavior
    			// where a mouse click can activate elements with tabindex="-1".
    			const blurListener = () => {
    				elem.removeAttribute(TABINDEX);
    				unlisten();
    			};
    			unlisten = addListener(elem, "blur", blurListener);
    		}
    		elem.focus();
    		return document.activeElement === elem;
    	} catch (e) {
    		// Apparently trying to focus a disabled element in IE can throw.
    		// See https://stackoverflow.com/a/1600194/2476884
    		return false;
    	}
    }

    function isEndMarker(elem, id) {
    	return Number(elem.dataset.svnavRouteEnd) === id;
    }

    function isHeading(elem) {
    	return /^H[1-6]$/i.test(elem.tagName);
    }

    function query(selector, parent = document) {
    	return parent.querySelector(selector);
    }

    function queryHeading(id) {
    	const marker = query(`[data-svnav-route-start="${id}"]`);
    	let current = marker.nextElementSibling;
    	while (!isEndMarker(current, id)) {
    		if (isHeading(current)) {
    			return current;
    		}
    		const heading = query("h1,h2,h3,h4,h5,h6", current);
    		if (heading) {
    			return heading;
    		}
    		current = current.nextElementSibling;
    	}
    	return null;
    }

    function handleFocus(route) {
    	Promise.resolve(get_store_value(route.focusElement)).then(elem => {
    		const focusElement = elem || queryHeading(route.id);
    		if (!focusElement) {
    			warn(
    				ROUTER_ID,
    				"Could not find an element to focus. " +
    					"You should always render a header for accessibility reasons, " +
    					'or set a custom focus element via the "useFocus" hook. ' +
    					"If you don't want this Route or Router to manage focus, " +
    					'pass "primary={false}" to it.',
    				route,
    				ROUTE_ID,
    			);
    		}
    		const headingFocused = focus(focusElement);
    		if (headingFocused) return;
    		focus(document.documentElement);
    	});
    }

    const createTriggerFocus = (a11yConfig, announcementText, location) => (
    	manageFocus,
    	announceNavigation,
    ) =>
    	// Wait until the dom is updated, so we can look for headings
    	tick().then(() => {
    		if (!focusCandidate || initialNavigation) {
    			initialNavigationOccurred();
    			return;
    		}
    		if (manageFocus) {
    			handleFocus(focusCandidate.route);
    		}
    		if (a11yConfig.announcements && announceNavigation) {
    			const { path, fullPath, meta, params, uri } = focusCandidate.route;
    			const announcementMessage = a11yConfig.createAnnouncement(
    				{ path, fullPath, meta, params, uri },
    				get_store_value(location),
    			);
    			Promise.resolve(announcementMessage).then(message => {
    				announcementText.set(message);
    			});
    		}
    		clearFocusCandidate();
    	});

    const visuallyHiddenStyle =
    	"position:fixed;" +
    	"top:-1px;" +
    	"left:0;" +
    	"width:1px;" +
    	"height:1px;" +
    	"padding:0;" +
    	"overflow:hidden;" +
    	"clip:rect(0,0,0,0);" +
    	"white-space:nowrap;" +
    	"border:0;";

    /* node_modules\svelte-navigator\src\Router.svelte generated by Svelte v3.48.0 */

    const file$i = "node_modules\\svelte-navigator\\src\\Router.svelte";

    // (195:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}
    function create_if_block$b(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*$announcementText*/ ctx[0]);
    			attr_dev(div, "role", "status");
    			attr_dev(div, "aria-atomic", "true");
    			attr_dev(div, "aria-live", "polite");
    			attr_dev(div, "style", visuallyHiddenStyle);
    			add_location(div, file$i, 195, 1, 5906);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$announcementText*/ 1) set_data_dev(t, /*$announcementText*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(195:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block_anchor;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);
    	let if_block = /*isTopLevelRouter*/ ctx[2] && /*manageFocus*/ ctx[4] && /*a11yConfig*/ ctx[1].announcements && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    			set_style(div, "display", "none");
    			attr_dev(div, "aria-hidden", "true");
    			attr_dev(div, "data-svnav-router", /*routerId*/ ctx[3]);
    			add_location(div, file$i, 190, 0, 5750);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t0, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 524288)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*isTopLevelRouter*/ ctx[2] && /*manageFocus*/ ctx[4] && /*a11yConfig*/ ctx[1].announcements) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t0);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const createId$1 = createCounter();
    const defaultBasepath = "/";

    function instance$o($$self, $$props, $$invalidate) {
    	let $location;
    	let $activeRoute;
    	let $prevLocation;
    	let $routes;
    	let $announcementText;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = defaultBasepath } = $$props;
    	let { url = null } = $$props;
    	let { history = globalHistory } = $$props;
    	let { primary = true } = $$props;
    	let { a11y = {} } = $$props;

    	const a11yConfig = {
    		createAnnouncement: route => `Navigated to ${route.uri}`,
    		announcements: true,
    		...a11y
    	};

    	// Remember the initial `basepath`, so we can fire a warning
    	// when the user changes it later
    	const initialBasepath = basepath;

    	const normalizedBasepath = normalizePath(basepath);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const isTopLevelRouter = !locationContext;
    	const routerId = createId$1();
    	const manageFocus = primary && !(routerContext && !routerContext.manageFocus);
    	const announcementText = writable("");
    	validate_store(announcementText, 'announcementText');
    	component_subscribe($$self, announcementText, value => $$invalidate(0, $announcementText = value));
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(18, $routes = value));
    	const activeRoute = writable(null);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(16, $activeRoute = value));

    	// Used in SSR to synchronously set that a Route is active.
    	let hasActiveRoute = false;

    	// Nesting level of router.
    	// We will need this to identify sibling routers, when moving
    	// focus on navigation, so we can focus the first possible router
    	const level = isTopLevelRouter ? 0 : routerContext.level + 1;

    	// If we're running an SSR we force the location to the `url` prop
    	const getInitialLocation = () => normalizeLocation(isSSR ? createLocation(url) : history.location, normalizedBasepath);

    	const location = isTopLevelRouter
    	? writable(getInitialLocation())
    	: locationContext;

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(15, $location = value));
    	const prevLocation = writable($location);
    	validate_store(prevLocation, 'prevLocation');
    	component_subscribe($$self, prevLocation, value => $$invalidate(17, $prevLocation = value));
    	const triggerFocus = createTriggerFocus(a11yConfig, announcementText, location);
    	const createRouteFilter = routeId => routeList => routeList.filter(routeItem => routeItem.id !== routeId);

    	function registerRoute(route) {
    		if (isSSR) {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				hasActiveRoute = true;

    				// Return the match in SSR mode, so the matched Route can use it immediatly.
    				// Waiting for activeRoute to update does not work, because it updates
    				// after the Route is initialized
    				return matchingRoute; // eslint-disable-line consistent-return
    			}
    		} else {
    			routes.update(prevRoutes => {
    				// Remove an old version of the updated route,
    				// before pushing the new version
    				const nextRoutes = createRouteFilter(route.id)(prevRoutes);

    				nextRoutes.push(route);
    				return nextRoutes;
    			});
    		}
    	}

    	function unregisterRoute(routeId) {
    		routes.update(createRouteFilter(routeId));
    	}

    	if (!isTopLevelRouter && basepath !== defaultBasepath) {
    		warn(ROUTER_ID, 'Only top-level Routers can have a "basepath" prop. It is ignored.', { basepath });
    	}

    	if (isTopLevelRouter) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(changedHistory => {
    				const normalizedLocation = normalizeLocation(changedHistory.location, normalizedBasepath);
    				prevLocation.set($location);
    				location.set(normalizedLocation);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		registerRoute,
    		unregisterRoute,
    		manageFocus,
    		level,
    		id: routerId,
    		history: isTopLevelRouter ? history : routerContext.history,
    		basepath: isTopLevelRouter
    		? normalizedBasepath
    		: routerContext.basepath
    	});

    	const writable_props = ['basepath', 'url', 'history', 'primary', 'a11y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(10, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(11, url = $$props.url);
    		if ('history' in $$props) $$invalidate(12, history = $$props.history);
    		if ('primary' in $$props) $$invalidate(13, primary = $$props.primary);
    		if ('a11y' in $$props) $$invalidate(14, a11y = $$props.a11y);
    		if ('$$scope' in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createCounter,
    		createId: createId$1,
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		normalizePath,
    		pick: pick$1,
    		match,
    		normalizeLocation,
    		createLocation,
    		isSSR,
    		warn,
    		ROUTER_ID,
    		pushFocusCandidate,
    		visuallyHiddenStyle,
    		createTriggerFocus,
    		defaultBasepath,
    		basepath,
    		url,
    		history,
    		primary,
    		a11y,
    		a11yConfig,
    		initialBasepath,
    		normalizedBasepath,
    		locationContext,
    		routerContext,
    		isTopLevelRouter,
    		routerId,
    		manageFocus,
    		announcementText,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		level,
    		getInitialLocation,
    		location,
    		prevLocation,
    		triggerFocus,
    		createRouteFilter,
    		registerRoute,
    		unregisterRoute,
    		$location,
    		$activeRoute,
    		$prevLocation,
    		$routes,
    		$announcementText
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(10, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(11, url = $$props.url);
    		if ('history' in $$props) $$invalidate(12, history = $$props.history);
    		if ('primary' in $$props) $$invalidate(13, primary = $$props.primary);
    		if ('a11y' in $$props) $$invalidate(14, a11y = $$props.a11y);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*basepath*/ 1024) {
    			if (basepath !== initialBasepath) {
    				warn(ROUTER_ID, 'You cannot change the "basepath" prop. It is ignored.');
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$routes, $location*/ 294912) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick$1($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$location, $prevLocation*/ 163840) {
    			// Manage focus and announce navigation to screen reader users
    			{
    				if (isTopLevelRouter) {
    					const hasHash = !!$location.hash;

    					// When a hash is present in the url, we skip focus management, because
    					// focusing a different element will prevent in-page jumps (See #3)
    					const shouldManageFocus = !hasHash && manageFocus;

    					// We don't want to make an announcement, when the hash changes,
    					// but the active route stays the same
    					const announceNavigation = !hasHash || $location.pathname !== $prevLocation.pathname;

    					triggerFocus(shouldManageFocus, announceNavigation);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$activeRoute*/ 65536) {
    			// Queue matched Route, so top level Router can decide which Route to focus.
    			// Non primary Routers should just be ignored
    			if (manageFocus && $activeRoute && $activeRoute.primary) {
    				pushFocusCandidate({ level, routerId, route: $activeRoute });
    			}
    		}
    	};

    	return [
    		$announcementText,
    		a11yConfig,
    		isTopLevelRouter,
    		routerId,
    		manageFocus,
    		announcementText,
    		routes,
    		activeRoute,
    		location,
    		prevLocation,
    		basepath,
    		url,
    		history,
    		primary,
    		a11y,
    		$location,
    		$activeRoute,
    		$prevLocation,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$o,
    			create_fragment$o,
    			safe_not_equal,
    			{
    				basepath: 10,
    				url: 11,
    				history: 12,
    				primary: 13,
    				a11y: 14
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get history() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set history(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get a11y() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set a11y(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Router$1 = Router;

    /**
     * Check if a component or hook have been created outside of a
     * context providing component
     * @param {number} componentId
     * @param {*} props
     * @param {string?} ctxKey
     * @param {number?} ctxProviderId
     */
    function usePreflightCheck(
    	componentId,
    	props,
    	ctxKey = ROUTER,
    	ctxProviderId = ROUTER_ID,
    ) {
    	const ctx = getContext(ctxKey);
    	if (!ctx) {
    		fail(
    			componentId,
    			label =>
    				`You cannot use ${label} outside of a ${createLabel(ctxProviderId)}.`,
    			props,
    		);
    	}
    }

    const toReadonly = ctx => {
    	const { subscribe } = getContext(ctx);
    	return { subscribe };
    };

    /**
     * Access the current location via a readable store.
     * @returns {import("svelte/store").Readable<{
        pathname: string;
        search: string;
        hash: string;
        state: {};
      }>}
     *
     * @example
      ```html
      <script>
        import { useLocation } from "svelte-navigator";

        const location = useLocation();

        $: console.log($location);
        // {
        //   pathname: "/blog",
        //   search: "?id=123",
        //   hash: "#comments",
        //   state: {}
        // }
      </script>
      ```
     */
    function useLocation() {
    	usePreflightCheck(USE_LOCATION_ID);
    	return toReadonly(LOCATION);
    }

    /**
     * @typedef {{
        path: string;
        fullPath: string;
        uri: string;
        params: {};
      }} RouteMatch
     */

    /**
     * @typedef {import("svelte/store").Readable<RouteMatch|null>} RouteMatchStore
     */

    /**
     * Access the history of top level Router.
     */
    function useHistory() {
    	const { history } = getContext(ROUTER);
    	return history;
    }

    /**
     * Access the base of the parent Route.
     */
    function useRouteBase() {
    	const route = getContext(ROUTE);
    	return route ? derived(route, _route => _route.base) : writable("/");
    }

    /**
     * Resolve a given link relative to the current `Route` and the `Router`s `basepath`.
     * It is used under the hood in `Link` and `useNavigate`.
     * You can use it to manually resolve links, when using the `link` or `links` actions.
     *
     * @returns {(path: string) => string}
     *
     * @example
      ```html
      <script>
        import { link, useResolve } from "svelte-navigator";

        const resolve = useResolve();
        // `resolvedLink` will be resolved relative to its parent Route
        // and the Routers `basepath`
        const resolvedLink = resolve("relativePath");
      </script>

      <a href={resolvedLink} use:link>Relative link</a>
      ```
     */
    function useResolve() {
    	usePreflightCheck(USE_RESOLVE_ID);
    	const routeBase = useRouteBase();
    	const { basepath: appBase } = getContext(ROUTER);
    	/**
    	 * Resolves the path relative to the current route and basepath.
    	 *
    	 * @param {string} path The path to resolve
    	 * @returns {string} The resolved path
    	 */
    	const resolve = path => resolveLink(path, get_store_value(routeBase), appBase);
    	return resolve;
    }

    /**
     * A hook, that returns a context-aware version of `navigate`.
     * It will automatically resolve the given link relative to the current Route.
     * It will also resolve a link against the `basepath` of the Router.
     *
     * @example
      ```html
      <!-- App.svelte -->
      <script>
        import { link, Route } from "svelte-navigator";
        import RouteComponent from "./RouteComponent.svelte";
      </script>

      <Router>
        <Route path="route1">
          <RouteComponent />
        </Route>
        <!-- ... -->
      </Router>

      <!-- RouteComponent.svelte -->
      <script>
        import { useNavigate } from "svelte-navigator";

        const navigate = useNavigate();
      </script>

      <button on:click="{() => navigate('relativePath')}">
        go to /route1/relativePath
      </button>
      <button on:click="{() => navigate('/absolutePath')}">
        go to /absolutePath
      </button>
      ```
      *
      * @example
      ```html
      <!-- App.svelte -->
      <script>
        import { link, Route } from "svelte-navigator";
        import RouteComponent from "./RouteComponent.svelte";
      </script>

      <Router basepath="/base">
        <Route path="route1">
          <RouteComponent />
        </Route>
        <!-- ... -->
      </Router>

      <!-- RouteComponent.svelte -->
      <script>
        import { useNavigate } from "svelte-navigator";

        const navigate = useNavigate();
      </script>

      <button on:click="{() => navigate('relativePath')}">
        go to /base/route1/relativePath
      </button>
      <button on:click="{() => navigate('/absolutePath')}">
        go to /base/absolutePath
      </button>
      ```
     */
    function useNavigate() {
    	usePreflightCheck(USE_NAVIGATE_ID);
    	const resolve = useResolve();
    	const { navigate } = useHistory();
    	/**
    	 * Navigate to a new route.
    	 * Resolves the link relative to the current route and basepath.
    	 *
    	 * @param {string|number} to The path to navigate to.
    	 *
    	 * If `to` is a number we will navigate to the stack entry index + `to`
    	 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
    	 * @param {Object} options
    	 * @param {*} [options.state]
    	 * @param {boolean} [options.replace=false]
    	 */
    	const navigateRelative = (to, options) => {
    		// If to is a number, we navigate to the target stack entry via `history.go`.
    		// Otherwise resolve the link
    		const target = isNumber(to) ? to : resolve(to);
    		return navigate(target, options);
    	};
    	return navigateRelative;
    }

    /* node_modules\svelte-navigator\src\Route.svelte generated by Svelte v3.48.0 */
    const file$h = "node_modules\\svelte-navigator\\src\\Route.svelte";

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*$params*/ 16,
    	location: dirty & /*$location*/ 8
    });

    const get_default_slot_context = ctx => ({
    	params: isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4],
    	location: /*$location*/ ctx[3],
    	navigate: /*navigate*/ ctx[10]
    });

    // (97:0) {#if isActive}
    function create_if_block$a(ctx) {
    	let router;
    	let current;

    	router = new Router$1({
    			props: {
    				primary: /*primary*/ ctx[1],
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const router_changes = {};
    			if (dirty & /*primary*/ 2) router_changes.primary = /*primary*/ ctx[1];

    			if (dirty & /*$$scope, component, $location, $params, $$restProps*/ 264217) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(97:0) {#if isActive}",
    		ctx
    	});

    	return block;
    }

    // (113:2) {:else}
    function create_else_block$5(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $params, $location*/ 262168)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(113:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (105:2) {#if component !== null}
    function create_if_block_1$6(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[3] },
    		{ navigate: /*navigate*/ ctx[10] },
    		isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4],
    		/*$$restProps*/ ctx[11]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty$1();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, navigate, isSSR, get, params, $params, $$restProps*/ 3608)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 8 && { location: /*$location*/ ctx[3] },
    					dirty & /*navigate*/ 1024 && { navigate: /*navigate*/ ctx[10] },
    					dirty & /*isSSR, get, params, $params*/ 528 && get_spread_object(isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4]),
    					dirty & /*$$restProps*/ 2048 && get_spread_object(/*$$restProps*/ ctx[11])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(105:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    // (98:1) <Router {primary}>
    function create_default_slot$8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$6, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(98:1) <Router {primary}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let current;
    	let if_block = /*isActive*/ ctx[2] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			set_style(div0, "display", "none");
    			attr_dev(div0, "aria-hidden", "true");
    			attr_dev(div0, "data-svnav-route-start", /*id*/ ctx[5]);
    			add_location(div0, file$h, 95, 0, 2622);
    			set_style(div1, "display", "none");
    			attr_dev(div1, "aria-hidden", "true");
    			attr_dev(div1, "data-svnav-route-end", /*id*/ ctx[5]);
    			add_location(div1, file$h, 121, 0, 3295);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isActive*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isActive*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const createId = createCounter();

    function instance$n($$self, $$props, $$invalidate) {
    	let isActive;
    	const omit_props_names = ["path","component","meta","primary"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $activeRoute;
    	let $location;
    	let $parentBase;
    	let $params;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let { meta = {} } = $$props;
    	let { primary = true } = $$props;
    	usePreflightCheck(ROUTE_ID, $$props);
    	const id = createId();
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(15, $activeRoute = value));
    	const parentBase = useRouteBase();
    	validate_store(parentBase, 'parentBase');
    	component_subscribe($$self, parentBase, value => $$invalidate(16, $parentBase = value));
    	const location = useLocation();
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(3, $location = value));
    	const focusElement = writable(null);

    	// In SSR we cannot wait for $activeRoute to update,
    	// so we use the match returned from `registerRoute` instead
    	let ssrMatch;

    	const route = writable();
    	const params = writable({});
    	validate_store(params, 'params');
    	component_subscribe($$self, params, value => $$invalidate(4, $params = value));
    	setContext(ROUTE, route);
    	setContext(ROUTE_PARAMS, params);
    	setContext(FOCUS_ELEM, focusElement);

    	// We need to call useNavigate after the route is set,
    	// so we can use the routes path for link resolution
    	const navigate = useNavigate();

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway
    	if (!isSSR) {
    		onDestroy(() => unregisterRoute(id));
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(23, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('path' in $$new_props) $$invalidate(12, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('meta' in $$new_props) $$invalidate(13, meta = $$new_props.meta);
    		if ('primary' in $$new_props) $$invalidate(1, primary = $$new_props.primary);
    		if ('$$scope' in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createCounter,
    		createId,
    		getContext,
    		onDestroy,
    		setContext,
    		writable,
    		get: get_store_value,
    		Router: Router$1,
    		ROUTER,
    		ROUTE,
    		ROUTE_PARAMS,
    		FOCUS_ELEM,
    		useLocation,
    		useNavigate,
    		useRouteBase,
    		usePreflightCheck,
    		isSSR,
    		extractBaseUri,
    		join,
    		ROUTE_ID,
    		path,
    		component,
    		meta,
    		primary,
    		id,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		parentBase,
    		location,
    		focusElement,
    		ssrMatch,
    		route,
    		params,
    		navigate,
    		isActive,
    		$activeRoute,
    		$location,
    		$parentBase,
    		$params
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(23, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(12, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('meta' in $$props) $$invalidate(13, meta = $$new_props.meta);
    		if ('primary' in $$props) $$invalidate(1, primary = $$new_props.primary);
    		if ('ssrMatch' in $$props) $$invalidate(14, ssrMatch = $$new_props.ssrMatch);
    		if ('isActive' in $$props) $$invalidate(2, isActive = $$new_props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, $parentBase, meta, $location, primary*/ 77834) {
    			{
    				// The route store will be re-computed whenever props, location or parentBase change
    				const isDefault = path === "";

    				const rawBase = join($parentBase, path);

    				const updatedRoute = {
    					id,
    					path,
    					meta,
    					// If no path prop is given, this Route will act as the default Route
    					// that is rendered if no other Route in the Router is a match
    					default: isDefault,
    					fullPath: isDefault ? "" : rawBase,
    					base: isDefault
    					? $parentBase
    					: extractBaseUri(rawBase, $location.pathname),
    					primary,
    					focusElement
    				};

    				route.set(updatedRoute);

    				// If we're in SSR mode and the Route matches,
    				// `registerRoute` will return the match
    				$$invalidate(14, ssrMatch = registerRoute(updatedRoute));
    			}
    		}

    		if ($$self.$$.dirty & /*ssrMatch, $activeRoute*/ 49152) {
    			$$invalidate(2, isActive = !!(ssrMatch || $activeRoute && $activeRoute.id === id));
    		}

    		if ($$self.$$.dirty & /*isActive, ssrMatch, $activeRoute*/ 49156) {
    			if (isActive) {
    				const { params: activeParams } = ssrMatch || $activeRoute;
    				params.set(activeParams);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		primary,
    		isActive,
    		$location,
    		$params,
    		id,
    		activeRoute,
    		parentBase,
    		location,
    		params,
    		navigate,
    		$$restProps,
    		path,
    		meta,
    		ssrMatch,
    		$activeRoute,
    		$parentBase,
    		slots,
    		$$scope
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {
    			path: 12,
    			component: 0,
    			meta: 13,
    			primary: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get meta() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meta(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Route$1 = Route;

    /* node_modules\svelte-navigator\src\Link.svelte generated by Svelte v3.48.0 */
    const file$g = "node_modules\\svelte-navigator\\src\\Link.svelte";

    function create_fragment$m(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let a_levels = [{ href: /*href*/ ctx[0] }, /*ariaCurrent*/ ctx[2], /*props*/ ctx[1]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$g, 63, 0, 1735);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				dirty & /*ariaCurrent*/ 4 && /*ariaCurrent*/ ctx[2],
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let href;
    	let isPartiallyCurrent;
    	let isCurrent;
    	let ariaCurrent;
    	let props;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { to } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = null } = $$props;
    	usePreflightCheck(LINK_ID, $$props);
    	const location = useLocation();
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(11, $location = value));
    	const dispatch = createEventDispatcher();
    	const resolve = useResolve();
    	const { navigate } = useHistory();

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = isCurrent || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(17, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(5, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(6, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(7, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(8, getProps = $$new_props.getProps);
    		if ('$$scope' in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		useLocation,
    		useResolve,
    		useHistory,
    		usePreflightCheck,
    		shouldNavigate,
    		isFunction,
    		startsWith,
    		LINK_ID,
    		to,
    		replace,
    		state,
    		getProps,
    		location,
    		dispatch,
    		resolve,
    		navigate,
    		onClick,
    		href,
    		isCurrent,
    		isPartiallyCurrent,
    		props,
    		ariaCurrent,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ('to' in $$props) $$invalidate(5, to = $$new_props.to);
    		if ('replace' in $$props) $$invalidate(6, replace = $$new_props.replace);
    		if ('state' in $$props) $$invalidate(7, state = $$new_props.state);
    		if ('getProps' in $$props) $$invalidate(8, getProps = $$new_props.getProps);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('isCurrent' in $$props) $$invalidate(9, isCurrent = $$new_props.isCurrent);
    		if ('isPartiallyCurrent' in $$props) $$invalidate(10, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    		if ('ariaCurrent' in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $location*/ 2080) {
    			// We need to pass location here to force re-resolution of the link,
    			// when the pathname changes. Otherwise we could end up with stale path params,
    			// when for example an :id changes in the parent Routes path
    			$$invalidate(0, href = resolve(to, $location));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 2049) {
    			$$invalidate(10, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 2049) {
    			$$invalidate(9, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 512) {
    			$$invalidate(2, ariaCurrent = isCurrent ? { "aria-current": "page" } : {});
    		}

    		$$invalidate(1, props = (() => {
    			if (isFunction(getProps)) {
    				const dynamicProps = getProps({
    					location: $location,
    					href,
    					isPartiallyCurrent,
    					isCurrent
    				});

    				return { ...$$restProps, ...dynamicProps };
    			}

    			return $$restProps;
    		})());
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		href,
    		props,
    		ariaCurrent,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		isCurrent,
    		isPartiallyCurrent,
    		$location,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { to: 5, replace: 6, state: 7, getProps: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*to*/ ctx[5] === undefined && !('to' in props)) {
    			console.warn("<Link> was created without expected prop 'to'");
    		}
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Link$1 = Link;

    const PACKET_TYPES = Object.create(null); // no Map = no polyfill
    PACKET_TYPES["open"] = "0";
    PACKET_TYPES["close"] = "1";
    PACKET_TYPES["ping"] = "2";
    PACKET_TYPES["pong"] = "3";
    PACKET_TYPES["message"] = "4";
    PACKET_TYPES["upgrade"] = "5";
    PACKET_TYPES["noop"] = "6";
    const PACKET_TYPES_REVERSE = Object.create(null);
    Object.keys(PACKET_TYPES).forEach(key => {
        PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
    });
    const ERROR_PACKET = { type: "error", data: "parser error" };

    const withNativeBlob$1 = typeof Blob === "function" ||
        (typeof Blob !== "undefined" &&
            Object.prototype.toString.call(Blob) === "[object BlobConstructor]");
    const withNativeArrayBuffer$2 = typeof ArrayBuffer === "function";
    // ArrayBuffer.isView method is not defined in IE10
    const isView$1 = obj => {
        return typeof ArrayBuffer.isView === "function"
            ? ArrayBuffer.isView(obj)
            : obj && obj.buffer instanceof ArrayBuffer;
    };
    const encodePacket = ({ type, data }, supportsBinary, callback) => {
        if (withNativeBlob$1 && data instanceof Blob) {
            if (supportsBinary) {
                return callback(data);
            }
            else {
                return encodeBlobAsBase64(data, callback);
            }
        }
        else if (withNativeArrayBuffer$2 &&
            (data instanceof ArrayBuffer || isView$1(data))) {
            if (supportsBinary) {
                return callback(data);
            }
            else {
                return encodeBlobAsBase64(new Blob([data]), callback);
            }
        }
        // plain string
        return callback(PACKET_TYPES[type] + (data || ""));
    };
    const encodeBlobAsBase64 = (data, callback) => {
        const fileReader = new FileReader();
        fileReader.onload = function () {
            const content = fileReader.result.split(",")[1];
            callback("b" + content);
        };
        return fileReader.readAsDataURL(data);
    };

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    // Use a lookup table to find the index.
    const lookup$1 = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup$1[chars.charCodeAt(i)] = i;
    }
    const decode$1 = (base64) => {
        let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
        if (base64[base64.length - 1] === '=') {
            bufferLength--;
            if (base64[base64.length - 2] === '=') {
                bufferLength--;
            }
        }
        const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
        for (i = 0; i < len; i += 4) {
            encoded1 = lookup$1[base64.charCodeAt(i)];
            encoded2 = lookup$1[base64.charCodeAt(i + 1)];
            encoded3 = lookup$1[base64.charCodeAt(i + 2)];
            encoded4 = lookup$1[base64.charCodeAt(i + 3)];
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
        return arraybuffer;
    };

    const withNativeArrayBuffer$1 = typeof ArrayBuffer === "function";
    const decodePacket = (encodedPacket, binaryType) => {
        if (typeof encodedPacket !== "string") {
            return {
                type: "message",
                data: mapBinary(encodedPacket, binaryType)
            };
        }
        const type = encodedPacket.charAt(0);
        if (type === "b") {
            return {
                type: "message",
                data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
            };
        }
        const packetType = PACKET_TYPES_REVERSE[type];
        if (!packetType) {
            return ERROR_PACKET;
        }
        return encodedPacket.length > 1
            ? {
                type: PACKET_TYPES_REVERSE[type],
                data: encodedPacket.substring(1)
            }
            : {
                type: PACKET_TYPES_REVERSE[type]
            };
    };
    const decodeBase64Packet = (data, binaryType) => {
        if (withNativeArrayBuffer$1) {
            const decoded = decode$1(data);
            return mapBinary(decoded, binaryType);
        }
        else {
            return { base64: true, data }; // fallback for old browsers
        }
    };
    const mapBinary = (data, binaryType) => {
        switch (binaryType) {
            case "blob":
                return data instanceof ArrayBuffer ? new Blob([data]) : data;
            case "arraybuffer":
            default:
                return data; // assuming the data is already an ArrayBuffer
        }
    };

    const SEPARATOR = String.fromCharCode(30); // see https://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
    const encodePayload = (packets, callback) => {
        // some packets may be added to the array while encoding, so the initial length must be saved
        const length = packets.length;
        const encodedPackets = new Array(length);
        let count = 0;
        packets.forEach((packet, i) => {
            // force base64 encoding for binary packets
            encodePacket(packet, false, encodedPacket => {
                encodedPackets[i] = encodedPacket;
                if (++count === length) {
                    callback(encodedPackets.join(SEPARATOR));
                }
            });
        });
    };
    const decodePayload = (encodedPayload, binaryType) => {
        const encodedPackets = encodedPayload.split(SEPARATOR);
        const packets = [];
        for (let i = 0; i < encodedPackets.length; i++) {
            const decodedPacket = decodePacket(encodedPackets[i], binaryType);
            packets.push(decodedPacket);
            if (decodedPacket.type === "error") {
                break;
            }
        }
        return packets;
    };
    const protocol$1 = 4;

    /**
     * Initialize a new `Emitter`.
     *
     * @api public
     */

    function Emitter(obj) {
      if (obj) return mixin(obj);
    }

    /**
     * Mixin the emitter properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */

    function mixin(obj) {
      for (var key in Emitter.prototype) {
        obj[key] = Emitter.prototype[key];
      }
      return obj;
    }

    /**
     * Listen on the given `event` with `fn`.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.on =
    Emitter.prototype.addEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};
      (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
        .push(fn);
      return this;
    };

    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.once = function(event, fn){
      function on() {
        this.off(event, on);
        fn.apply(this, arguments);
      }

      on.fn = fn;
      this.on(event, on);
      return this;
    };

    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.off =
    Emitter.prototype.removeListener =
    Emitter.prototype.removeAllListeners =
    Emitter.prototype.removeEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};

      // all
      if (0 == arguments.length) {
        this._callbacks = {};
        return this;
      }

      // specific event
      var callbacks = this._callbacks['$' + event];
      if (!callbacks) return this;

      // remove all handlers
      if (1 == arguments.length) {
        delete this._callbacks['$' + event];
        return this;
      }

      // remove specific handler
      var cb;
      for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }

      // Remove event specific arrays for event types that no
      // one is subscribed for to avoid memory leak.
      if (callbacks.length === 0) {
        delete this._callbacks['$' + event];
      }

      return this;
    };

    /**
     * Emit `event` with the given args.
     *
     * @param {String} event
     * @param {Mixed} ...
     * @return {Emitter}
     */

    Emitter.prototype.emit = function(event){
      this._callbacks = this._callbacks || {};

      var args = new Array(arguments.length - 1)
        , callbacks = this._callbacks['$' + event];

      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }

      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
          callbacks[i].apply(this, args);
        }
      }

      return this;
    };

    // alias used for reserved events (protected method)
    Emitter.prototype.emitReserved = Emitter.prototype.emit;

    /**
     * Return array of callbacks for `event`.
     *
     * @param {String} event
     * @return {Array}
     * @api public
     */

    Emitter.prototype.listeners = function(event){
      this._callbacks = this._callbacks || {};
      return this._callbacks['$' + event] || [];
    };

    /**
     * Check if this emitter has `event` handlers.
     *
     * @param {String} event
     * @return {Boolean}
     * @api public
     */

    Emitter.prototype.hasListeners = function(event){
      return !! this.listeners(event).length;
    };

    const globalThisShim = (() => {
        if (typeof self !== "undefined") {
            return self;
        }
        else if (typeof window !== "undefined") {
            return window;
        }
        else {
            return Function("return this")();
        }
    })();

    function pick(obj, ...attr) {
        return attr.reduce((acc, k) => {
            if (obj.hasOwnProperty(k)) {
                acc[k] = obj[k];
            }
            return acc;
        }, {});
    }
    // Keep a reference to the real timeout functions so they can be used when overridden
    const NATIVE_SET_TIMEOUT = setTimeout;
    const NATIVE_CLEAR_TIMEOUT = clearTimeout;
    function installTimerFunctions(obj, opts) {
        if (opts.useNativeTimers) {
            obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
            obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
        }
        else {
            obj.setTimeoutFn = setTimeout.bind(globalThisShim);
            obj.clearTimeoutFn = clearTimeout.bind(globalThisShim);
        }
    }
    // base64 encoded buffers are about 33% bigger (https://en.wikipedia.org/wiki/Base64)
    const BASE64_OVERHEAD = 1.33;
    // we could also have used `new Blob([obj]).size`, but it isn't supported in IE9
    function byteLength(obj) {
        if (typeof obj === "string") {
            return utf8Length(obj);
        }
        // arraybuffer or blob
        return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
    }
    function utf8Length(str) {
        let c = 0, length = 0;
        for (let i = 0, l = str.length; i < l; i++) {
            c = str.charCodeAt(i);
            if (c < 0x80) {
                length += 1;
            }
            else if (c < 0x800) {
                length += 2;
            }
            else if (c < 0xd800 || c >= 0xe000) {
                length += 3;
            }
            else {
                i++;
                length += 4;
            }
        }
        return length;
    }

    class TransportError extends Error {
        constructor(reason, description, context) {
            super(reason);
            this.description = description;
            this.context = context;
            this.type = "TransportError";
        }
    }
    class Transport extends Emitter {
        /**
         * Transport abstract constructor.
         *
         * @param {Object} options.
         * @api private
         */
        constructor(opts) {
            super();
            this.writable = false;
            installTimerFunctions(this, opts);
            this.opts = opts;
            this.query = opts.query;
            this.readyState = "";
            this.socket = opts.socket;
        }
        /**
         * Emits an error.
         *
         * @param {String} reason
         * @param description
         * @param context - the error context
         * @return {Transport} for chaining
         * @api protected
         */
        onError(reason, description, context) {
            super.emitReserved("error", new TransportError(reason, description, context));
            return this;
        }
        /**
         * Opens the transport.
         *
         * @api public
         */
        open() {
            if ("closed" === this.readyState || "" === this.readyState) {
                this.readyState = "opening";
                this.doOpen();
            }
            return this;
        }
        /**
         * Closes the transport.
         *
         * @api public
         */
        close() {
            if ("opening" === this.readyState || "open" === this.readyState) {
                this.doClose();
                this.onClose();
            }
            return this;
        }
        /**
         * Sends multiple packets.
         *
         * @param {Array} packets
         * @api public
         */
        send(packets) {
            if ("open" === this.readyState) {
                this.write(packets);
            }
        }
        /**
         * Called upon open
         *
         * @api protected
         */
        onOpen() {
            this.readyState = "open";
            this.writable = true;
            super.emitReserved("open");
        }
        /**
         * Called with data.
         *
         * @param {String} data
         * @api protected
         */
        onData(data) {
            const packet = decodePacket(data, this.socket.binaryType);
            this.onPacket(packet);
        }
        /**
         * Called with a decoded packet.
         *
         * @api protected
         */
        onPacket(packet) {
            super.emitReserved("packet", packet);
        }
        /**
         * Called upon close.
         *
         * @api protected
         */
        onClose(details) {
            this.readyState = "closed";
            super.emitReserved("close", details);
        }
    }

    // imported from https://github.com/unshiftio/yeast
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(''), length = 64, map = {};
    let seed = 0, i = 0, prev;
    /**
     * Return a string representing the specified number.
     *
     * @param {Number} num The number to convert.
     * @returns {String} The string representation of the number.
     * @api public
     */
    function encode$1(num) {
        let encoded = '';
        do {
            encoded = alphabet[num % length] + encoded;
            num = Math.floor(num / length);
        } while (num > 0);
        return encoded;
    }
    /**
     * Yeast: A tiny growing id generator.
     *
     * @returns {String} A unique id.
     * @api public
     */
    function yeast() {
        const now = encode$1(+new Date());
        if (now !== prev)
            return seed = 0, prev = now;
        return now + '.' + encode$1(seed++);
    }
    //
    // Map each character to its index.
    //
    for (; i < length; i++)
        map[alphabet[i]] = i;

    // imported from https://github.com/galkn/querystring
    /**
     * Compiles a querystring
     * Returns string representation of the object
     *
     * @param {Object}
     * @api private
     */
    function encode(obj) {
        let str = '';
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (str.length)
                    str += '&';
                str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
            }
        }
        return str;
    }
    /**
     * Parses a simple querystring into an object
     *
     * @param {String} qs
     * @api private
     */
    function decode(qs) {
        let qry = {};
        let pairs = qs.split('&');
        for (let i = 0, l = pairs.length; i < l; i++) {
            let pair = pairs[i].split('=');
            qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return qry;
    }

    // imported from https://github.com/component/has-cors
    let value = false;
    try {
        value = typeof XMLHttpRequest !== 'undefined' &&
            'withCredentials' in new XMLHttpRequest();
    }
    catch (err) {
        // if XMLHttp support is disabled in IE then it will throw
        // when trying to create
    }
    const hasCORS = value;

    // browser shim for xmlhttprequest module
    function XHR(opts) {
        const xdomain = opts.xdomain;
        // XMLHttpRequest can be disabled on IE
        try {
            if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
                return new XMLHttpRequest();
            }
        }
        catch (e) { }
        if (!xdomain) {
            try {
                return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
            }
            catch (e) { }
        }
    }

    function empty() { }
    const hasXHR2 = (function () {
        const xhr = new XHR({
            xdomain: false
        });
        return null != xhr.responseType;
    })();
    class Polling extends Transport {
        /**
         * XHR Polling constructor.
         *
         * @param {Object} opts
         * @api public
         */
        constructor(opts) {
            super(opts);
            this.polling = false;
            if (typeof location !== "undefined") {
                const isSSL = "https:" === location.protocol;
                let port = location.port;
                // some user agents have empty `location.port`
                if (!port) {
                    port = isSSL ? "443" : "80";
                }
                this.xd =
                    (typeof location !== "undefined" &&
                        opts.hostname !== location.hostname) ||
                        port !== opts.port;
                this.xs = opts.secure !== isSSL;
            }
            /**
             * XHR supports binary
             */
            const forceBase64 = opts && opts.forceBase64;
            this.supportsBinary = hasXHR2 && !forceBase64;
        }
        /**
         * Transport name.
         */
        get name() {
            return "polling";
        }
        /**
         * Opens the socket (triggers polling). We write a PING message to determine
         * when the transport is open.
         *
         * @api private
         */
        doOpen() {
            this.poll();
        }
        /**
         * Pauses polling.
         *
         * @param {Function} callback upon buffers are flushed and transport is paused
         * @api private
         */
        pause(onPause) {
            this.readyState = "pausing";
            const pause = () => {
                this.readyState = "paused";
                onPause();
            };
            if (this.polling || !this.writable) {
                let total = 0;
                if (this.polling) {
                    total++;
                    this.once("pollComplete", function () {
                        --total || pause();
                    });
                }
                if (!this.writable) {
                    total++;
                    this.once("drain", function () {
                        --total || pause();
                    });
                }
            }
            else {
                pause();
            }
        }
        /**
         * Starts polling cycle.
         *
         * @api public
         */
        poll() {
            this.polling = true;
            this.doPoll();
            this.emitReserved("poll");
        }
        /**
         * Overloads onData to detect payloads.
         *
         * @api private
         */
        onData(data) {
            const callback = packet => {
                // if its the first message we consider the transport open
                if ("opening" === this.readyState && packet.type === "open") {
                    this.onOpen();
                }
                // if its a close packet, we close the ongoing requests
                if ("close" === packet.type) {
                    this.onClose({ description: "transport closed by the server" });
                    return false;
                }
                // otherwise bypass onData and handle the message
                this.onPacket(packet);
            };
            // decode payload
            decodePayload(data, this.socket.binaryType).forEach(callback);
            // if an event did not trigger closing
            if ("closed" !== this.readyState) {
                // if we got data we're not polling
                this.polling = false;
                this.emitReserved("pollComplete");
                if ("open" === this.readyState) {
                    this.poll();
                }
            }
        }
        /**
         * For polling, send a close packet.
         *
         * @api private
         */
        doClose() {
            const close = () => {
                this.write([{ type: "close" }]);
            };
            if ("open" === this.readyState) {
                close();
            }
            else {
                // in case we're trying to close while
                // handshaking is in progress (GH-164)
                this.once("open", close);
            }
        }
        /**
         * Writes a packets payload.
         *
         * @param {Array} data packets
         * @param {Function} drain callback
         * @api private
         */
        write(packets) {
            this.writable = false;
            encodePayload(packets, data => {
                this.doWrite(data, () => {
                    this.writable = true;
                    this.emitReserved("drain");
                });
            });
        }
        /**
         * Generates uri for connection.
         *
         * @api private
         */
        uri() {
            let query = this.query || {};
            const schema = this.opts.secure ? "https" : "http";
            let port = "";
            // cache busting is forced
            if (false !== this.opts.timestampRequests) {
                query[this.opts.timestampParam] = yeast();
            }
            if (!this.supportsBinary && !query.sid) {
                query.b64 = 1;
            }
            // avoid port if default for schema
            if (this.opts.port &&
                (("https" === schema && Number(this.opts.port) !== 443) ||
                    ("http" === schema && Number(this.opts.port) !== 80))) {
                port = ":" + this.opts.port;
            }
            const encodedQuery = encode(query);
            const ipv6 = this.opts.hostname.indexOf(":") !== -1;
            return (schema +
                "://" +
                (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
                port +
                this.opts.path +
                (encodedQuery.length ? "?" + encodedQuery : ""));
        }
        /**
         * Creates a request.
         *
         * @param {String} method
         * @api private
         */
        request(opts = {}) {
            Object.assign(opts, { xd: this.xd, xs: this.xs }, this.opts);
            return new Request(this.uri(), opts);
        }
        /**
         * Sends data.
         *
         * @param {String} data to send.
         * @param {Function} called upon flush.
         * @api private
         */
        doWrite(data, fn) {
            const req = this.request({
                method: "POST",
                data: data
            });
            req.on("success", fn);
            req.on("error", (xhrStatus, context) => {
                this.onError("xhr post error", xhrStatus, context);
            });
        }
        /**
         * Starts a poll cycle.
         *
         * @api private
         */
        doPoll() {
            const req = this.request();
            req.on("data", this.onData.bind(this));
            req.on("error", (xhrStatus, context) => {
                this.onError("xhr poll error", xhrStatus, context);
            });
            this.pollXhr = req;
        }
    }
    class Request extends Emitter {
        /**
         * Request constructor
         *
         * @param {Object} options
         * @api public
         */
        constructor(uri, opts) {
            super();
            installTimerFunctions(this, opts);
            this.opts = opts;
            this.method = opts.method || "GET";
            this.uri = uri;
            this.async = false !== opts.async;
            this.data = undefined !== opts.data ? opts.data : null;
            this.create();
        }
        /**
         * Creates the XHR object and sends the request.
         *
         * @api private
         */
        create() {
            const opts = pick(this.opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
            opts.xdomain = !!this.opts.xd;
            opts.xscheme = !!this.opts.xs;
            const xhr = (this.xhr = new XHR(opts));
            try {
                xhr.open(this.method, this.uri, this.async);
                try {
                    if (this.opts.extraHeaders) {
                        xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
                        for (let i in this.opts.extraHeaders) {
                            if (this.opts.extraHeaders.hasOwnProperty(i)) {
                                xhr.setRequestHeader(i, this.opts.extraHeaders[i]);
                            }
                        }
                    }
                }
                catch (e) { }
                if ("POST" === this.method) {
                    try {
                        xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                    }
                    catch (e) { }
                }
                try {
                    xhr.setRequestHeader("Accept", "*/*");
                }
                catch (e) { }
                // ie6 check
                if ("withCredentials" in xhr) {
                    xhr.withCredentials = this.opts.withCredentials;
                }
                if (this.opts.requestTimeout) {
                    xhr.timeout = this.opts.requestTimeout;
                }
                xhr.onreadystatechange = () => {
                    if (4 !== xhr.readyState)
                        return;
                    if (200 === xhr.status || 1223 === xhr.status) {
                        this.onLoad();
                    }
                    else {
                        // make sure the `error` event handler that's user-set
                        // does not throw in the same tick and gets caught here
                        this.setTimeoutFn(() => {
                            this.onError(typeof xhr.status === "number" ? xhr.status : 0);
                        }, 0);
                    }
                };
                xhr.send(this.data);
            }
            catch (e) {
                // Need to defer since .create() is called directly from the constructor
                // and thus the 'error' event can only be only bound *after* this exception
                // occurs.  Therefore, also, we cannot throw here at all.
                this.setTimeoutFn(() => {
                    this.onError(e);
                }, 0);
                return;
            }
            if (typeof document !== "undefined") {
                this.index = Request.requestsCount++;
                Request.requests[this.index] = this;
            }
        }
        /**
         * Called upon error.
         *
         * @api private
         */
        onError(err) {
            this.emitReserved("error", err, this.xhr);
            this.cleanup(true);
        }
        /**
         * Cleans up house.
         *
         * @api private
         */
        cleanup(fromError) {
            if ("undefined" === typeof this.xhr || null === this.xhr) {
                return;
            }
            this.xhr.onreadystatechange = empty;
            if (fromError) {
                try {
                    this.xhr.abort();
                }
                catch (e) { }
            }
            if (typeof document !== "undefined") {
                delete Request.requests[this.index];
            }
            this.xhr = null;
        }
        /**
         * Called upon load.
         *
         * @api private
         */
        onLoad() {
            const data = this.xhr.responseText;
            if (data !== null) {
                this.emitReserved("data", data);
                this.emitReserved("success");
                this.cleanup();
            }
        }
        /**
         * Aborts the request.
         *
         * @api public
         */
        abort() {
            this.cleanup();
        }
    }
    Request.requestsCount = 0;
    Request.requests = {};
    /**
     * Aborts pending requests when unloading the window. This is needed to prevent
     * memory leaks (e.g. when using IE) and to ensure that no spurious error is
     * emitted.
     */
    if (typeof document !== "undefined") {
        // @ts-ignore
        if (typeof attachEvent === "function") {
            // @ts-ignore
            attachEvent("onunload", unloadHandler);
        }
        else if (typeof addEventListener === "function") {
            const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
            addEventListener(terminationEvent, unloadHandler, false);
        }
    }
    function unloadHandler() {
        for (let i in Request.requests) {
            if (Request.requests.hasOwnProperty(i)) {
                Request.requests[i].abort();
            }
        }
    }

    const nextTick = (() => {
        const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
        if (isPromiseAvailable) {
            return cb => Promise.resolve().then(cb);
        }
        else {
            return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
        }
    })();
    const WebSocket = globalThisShim.WebSocket || globalThisShim.MozWebSocket;
    const usingBrowserWebSocket = true;
    const defaultBinaryType = "arraybuffer";

    // detect ReactNative environment
    const isReactNative = typeof navigator !== "undefined" &&
        typeof navigator.product === "string" &&
        navigator.product.toLowerCase() === "reactnative";
    class WS extends Transport {
        /**
         * WebSocket transport constructor.
         *
         * @api {Object} connection options
         * @api public
         */
        constructor(opts) {
            super(opts);
            this.supportsBinary = !opts.forceBase64;
        }
        /**
         * Transport name.
         *
         * @api public
         */
        get name() {
            return "websocket";
        }
        /**
         * Opens socket.
         *
         * @api private
         */
        doOpen() {
            if (!this.check()) {
                // let probe timeout
                return;
            }
            const uri = this.uri();
            const protocols = this.opts.protocols;
            // React Native only supports the 'headers' option, and will print a warning if anything else is passed
            const opts = isReactNative
                ? {}
                : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
            if (this.opts.extraHeaders) {
                opts.headers = this.opts.extraHeaders;
            }
            try {
                this.ws =
                    usingBrowserWebSocket && !isReactNative
                        ? protocols
                            ? new WebSocket(uri, protocols)
                            : new WebSocket(uri)
                        : new WebSocket(uri, protocols, opts);
            }
            catch (err) {
                return this.emitReserved("error", err);
            }
            this.ws.binaryType = this.socket.binaryType || defaultBinaryType;
            this.addEventListeners();
        }
        /**
         * Adds event listeners to the socket
         *
         * @api private
         */
        addEventListeners() {
            this.ws.onopen = () => {
                if (this.opts.autoUnref) {
                    this.ws._socket.unref();
                }
                this.onOpen();
            };
            this.ws.onclose = closeEvent => this.onClose({
                description: "websocket connection closed",
                context: closeEvent
            });
            this.ws.onmessage = ev => this.onData(ev.data);
            this.ws.onerror = e => this.onError("websocket error", e);
        }
        /**
         * Writes data to socket.
         *
         * @param {Array} array of packets.
         * @api private
         */
        write(packets) {
            this.writable = false;
            // encodePacket efficient as it uses WS framing
            // no need for encodePayload
            for (let i = 0; i < packets.length; i++) {
                const packet = packets[i];
                const lastPacket = i === packets.length - 1;
                encodePacket(packet, this.supportsBinary, data => {
                    // always create a new object (GH-437)
                    const opts = {};
                    // Sometimes the websocket has already been closed but the browser didn't
                    // have a chance of informing us about it yet, in that case send will
                    // throw an error
                    try {
                        if (usingBrowserWebSocket) {
                            // TypeError is thrown when passing the second argument on Safari
                            this.ws.send(data);
                        }
                    }
                    catch (e) {
                    }
                    if (lastPacket) {
                        // fake drain
                        // defer to next tick to allow Socket to clear writeBuffer
                        nextTick(() => {
                            this.writable = true;
                            this.emitReserved("drain");
                        }, this.setTimeoutFn);
                    }
                });
            }
        }
        /**
         * Closes socket.
         *
         * @api private
         */
        doClose() {
            if (typeof this.ws !== "undefined") {
                this.ws.close();
                this.ws = null;
            }
        }
        /**
         * Generates uri for connection.
         *
         * @api private
         */
        uri() {
            let query = this.query || {};
            const schema = this.opts.secure ? "wss" : "ws";
            let port = "";
            // avoid port if default for schema
            if (this.opts.port &&
                (("wss" === schema && Number(this.opts.port) !== 443) ||
                    ("ws" === schema && Number(this.opts.port) !== 80))) {
                port = ":" + this.opts.port;
            }
            // append timestamp to URI
            if (this.opts.timestampRequests) {
                query[this.opts.timestampParam] = yeast();
            }
            // communicate binary support capabilities
            if (!this.supportsBinary) {
                query.b64 = 1;
            }
            const encodedQuery = encode(query);
            const ipv6 = this.opts.hostname.indexOf(":") !== -1;
            return (schema +
                "://" +
                (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
                port +
                this.opts.path +
                (encodedQuery.length ? "?" + encodedQuery : ""));
        }
        /**
         * Feature detection for WebSocket.
         *
         * @return {Boolean} whether this transport is available.
         * @api public
         */
        check() {
            return !!WebSocket;
        }
    }

    const transports = {
        websocket: WS,
        polling: Polling
    };

    // imported from https://github.com/galkn/parseuri
    /**
     * Parses an URI
     *
     * @author Steven Levithan <stevenlevithan.com> (MIT license)
     * @api private
     */
    const re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
    const parts = [
        'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
    ];
    function parse(str) {
        const src = str, b = str.indexOf('['), e = str.indexOf(']');
        if (b != -1 && e != -1) {
            str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
        }
        let m = re.exec(str || ''), uri = {}, i = 14;
        while (i--) {
            uri[parts[i]] = m[i] || '';
        }
        if (b != -1 && e != -1) {
            uri.source = src;
            uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
            uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
            uri.ipv6uri = true;
        }
        uri.pathNames = pathNames(uri, uri['path']);
        uri.queryKey = queryKey(uri, uri['query']);
        return uri;
    }
    function pathNames(obj, path) {
        const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
        if (path.substr(0, 1) == '/' || path.length === 0) {
            names.splice(0, 1);
        }
        if (path.substr(path.length - 1, 1) == '/') {
            names.splice(names.length - 1, 1);
        }
        return names;
    }
    function queryKey(uri, query) {
        const data = {};
        query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
            if ($1) {
                data[$1] = $2;
            }
        });
        return data;
    }

    class Socket$1 extends Emitter {
        /**
         * Socket constructor.
         *
         * @param {String|Object} uri or options
         * @param {Object} opts - options
         * @api public
         */
        constructor(uri, opts = {}) {
            super();
            if (uri && "object" === typeof uri) {
                opts = uri;
                uri = null;
            }
            if (uri) {
                uri = parse(uri);
                opts.hostname = uri.host;
                opts.secure = uri.protocol === "https" || uri.protocol === "wss";
                opts.port = uri.port;
                if (uri.query)
                    opts.query = uri.query;
            }
            else if (opts.host) {
                opts.hostname = parse(opts.host).host;
            }
            installTimerFunctions(this, opts);
            this.secure =
                null != opts.secure
                    ? opts.secure
                    : typeof location !== "undefined" && "https:" === location.protocol;
            if (opts.hostname && !opts.port) {
                // if no port is specified manually, use the protocol default
                opts.port = this.secure ? "443" : "80";
            }
            this.hostname =
                opts.hostname ||
                    (typeof location !== "undefined" ? location.hostname : "localhost");
            this.port =
                opts.port ||
                    (typeof location !== "undefined" && location.port
                        ? location.port
                        : this.secure
                            ? "443"
                            : "80");
            this.transports = opts.transports || ["polling", "websocket"];
            this.readyState = "";
            this.writeBuffer = [];
            this.prevBufferLen = 0;
            this.opts = Object.assign({
                path: "/engine.io",
                agent: false,
                withCredentials: false,
                upgrade: true,
                timestampParam: "t",
                rememberUpgrade: false,
                rejectUnauthorized: true,
                perMessageDeflate: {
                    threshold: 1024
                },
                transportOptions: {},
                closeOnBeforeunload: true
            }, opts);
            this.opts.path = this.opts.path.replace(/\/$/, "") + "/";
            if (typeof this.opts.query === "string") {
                this.opts.query = decode(this.opts.query);
            }
            // set on handshake
            this.id = null;
            this.upgrades = null;
            this.pingInterval = null;
            this.pingTimeout = null;
            // set on heartbeat
            this.pingTimeoutTimer = null;
            if (typeof addEventListener === "function") {
                if (this.opts.closeOnBeforeunload) {
                    // Firefox closes the connection when the "beforeunload" event is emitted but not Chrome. This event listener
                    // ensures every browser behaves the same (no "disconnect" event at the Socket.IO level when the page is
                    // closed/reloaded)
                    addEventListener("beforeunload", () => {
                        if (this.transport) {
                            // silently close the transport
                            this.transport.removeAllListeners();
                            this.transport.close();
                        }
                    }, false);
                }
                if (this.hostname !== "localhost") {
                    this.offlineEventListener = () => {
                        this.onClose("transport close", {
                            description: "network connection lost"
                        });
                    };
                    addEventListener("offline", this.offlineEventListener, false);
                }
            }
            this.open();
        }
        /**
         * Creates transport of the given type.
         *
         * @param {String} transport name
         * @return {Transport}
         * @api private
         */
        createTransport(name) {
            const query = Object.assign({}, this.opts.query);
            // append engine.io protocol identifier
            query.EIO = protocol$1;
            // transport name
            query.transport = name;
            // session id if we already have one
            if (this.id)
                query.sid = this.id;
            const opts = Object.assign({}, this.opts.transportOptions[name], this.opts, {
                query,
                socket: this,
                hostname: this.hostname,
                secure: this.secure,
                port: this.port
            });
            return new transports[name](opts);
        }
        /**
         * Initializes transport to use and starts probe.
         *
         * @api private
         */
        open() {
            let transport;
            if (this.opts.rememberUpgrade &&
                Socket$1.priorWebsocketSuccess &&
                this.transports.indexOf("websocket") !== -1) {
                transport = "websocket";
            }
            else if (0 === this.transports.length) {
                // Emit error on next tick so it can be listened to
                this.setTimeoutFn(() => {
                    this.emitReserved("error", "No transports available");
                }, 0);
                return;
            }
            else {
                transport = this.transports[0];
            }
            this.readyState = "opening";
            // Retry with the next transport if the transport is disabled (jsonp: false)
            try {
                transport = this.createTransport(transport);
            }
            catch (e) {
                this.transports.shift();
                this.open();
                return;
            }
            transport.open();
            this.setTransport(transport);
        }
        /**
         * Sets the current transport. Disables the existing one (if any).
         *
         * @api private
         */
        setTransport(transport) {
            if (this.transport) {
                this.transport.removeAllListeners();
            }
            // set up transport
            this.transport = transport;
            // set up transport listeners
            transport
                .on("drain", this.onDrain.bind(this))
                .on("packet", this.onPacket.bind(this))
                .on("error", this.onError.bind(this))
                .on("close", reason => this.onClose("transport close", reason));
        }
        /**
         * Probes a transport.
         *
         * @param {String} transport name
         * @api private
         */
        probe(name) {
            let transport = this.createTransport(name);
            let failed = false;
            Socket$1.priorWebsocketSuccess = false;
            const onTransportOpen = () => {
                if (failed)
                    return;
                transport.send([{ type: "ping", data: "probe" }]);
                transport.once("packet", msg => {
                    if (failed)
                        return;
                    if ("pong" === msg.type && "probe" === msg.data) {
                        this.upgrading = true;
                        this.emitReserved("upgrading", transport);
                        if (!transport)
                            return;
                        Socket$1.priorWebsocketSuccess = "websocket" === transport.name;
                        this.transport.pause(() => {
                            if (failed)
                                return;
                            if ("closed" === this.readyState)
                                return;
                            cleanup();
                            this.setTransport(transport);
                            transport.send([{ type: "upgrade" }]);
                            this.emitReserved("upgrade", transport);
                            transport = null;
                            this.upgrading = false;
                            this.flush();
                        });
                    }
                    else {
                        const err = new Error("probe error");
                        // @ts-ignore
                        err.transport = transport.name;
                        this.emitReserved("upgradeError", err);
                    }
                });
            };
            function freezeTransport() {
                if (failed)
                    return;
                // Any callback called by transport should be ignored since now
                failed = true;
                cleanup();
                transport.close();
                transport = null;
            }
            // Handle any error that happens while probing
            const onerror = err => {
                const error = new Error("probe error: " + err);
                // @ts-ignore
                error.transport = transport.name;
                freezeTransport();
                this.emitReserved("upgradeError", error);
            };
            function onTransportClose() {
                onerror("transport closed");
            }
            // When the socket is closed while we're probing
            function onclose() {
                onerror("socket closed");
            }
            // When the socket is upgraded while we're probing
            function onupgrade(to) {
                if (transport && to.name !== transport.name) {
                    freezeTransport();
                }
            }
            // Remove all listeners on the transport and on self
            const cleanup = () => {
                transport.removeListener("open", onTransportOpen);
                transport.removeListener("error", onerror);
                transport.removeListener("close", onTransportClose);
                this.off("close", onclose);
                this.off("upgrading", onupgrade);
            };
            transport.once("open", onTransportOpen);
            transport.once("error", onerror);
            transport.once("close", onTransportClose);
            this.once("close", onclose);
            this.once("upgrading", onupgrade);
            transport.open();
        }
        /**
         * Called when connection is deemed open.
         *
         * @api private
         */
        onOpen() {
            this.readyState = "open";
            Socket$1.priorWebsocketSuccess = "websocket" === this.transport.name;
            this.emitReserved("open");
            this.flush();
            // we check for `readyState` in case an `open`
            // listener already closed the socket
            if ("open" === this.readyState &&
                this.opts.upgrade &&
                this.transport.pause) {
                let i = 0;
                const l = this.upgrades.length;
                for (; i < l; i++) {
                    this.probe(this.upgrades[i]);
                }
            }
        }
        /**
         * Handles a packet.
         *
         * @api private
         */
        onPacket(packet) {
            if ("opening" === this.readyState ||
                "open" === this.readyState ||
                "closing" === this.readyState) {
                this.emitReserved("packet", packet);
                // Socket is live - any packet counts
                this.emitReserved("heartbeat");
                switch (packet.type) {
                    case "open":
                        this.onHandshake(JSON.parse(packet.data));
                        break;
                    case "ping":
                        this.resetPingTimeout();
                        this.sendPacket("pong");
                        this.emitReserved("ping");
                        this.emitReserved("pong");
                        break;
                    case "error":
                        const err = new Error("server error");
                        // @ts-ignore
                        err.code = packet.data;
                        this.onError(err);
                        break;
                    case "message":
                        this.emitReserved("data", packet.data);
                        this.emitReserved("message", packet.data);
                        break;
                }
            }
        }
        /**
         * Called upon handshake completion.
         *
         * @param {Object} data - handshake obj
         * @api private
         */
        onHandshake(data) {
            this.emitReserved("handshake", data);
            this.id = data.sid;
            this.transport.query.sid = data.sid;
            this.upgrades = this.filterUpgrades(data.upgrades);
            this.pingInterval = data.pingInterval;
            this.pingTimeout = data.pingTimeout;
            this.maxPayload = data.maxPayload;
            this.onOpen();
            // In case open handler closes socket
            if ("closed" === this.readyState)
                return;
            this.resetPingTimeout();
        }
        /**
         * Sets and resets ping timeout timer based on server pings.
         *
         * @api private
         */
        resetPingTimeout() {
            this.clearTimeoutFn(this.pingTimeoutTimer);
            this.pingTimeoutTimer = this.setTimeoutFn(() => {
                this.onClose("ping timeout");
            }, this.pingInterval + this.pingTimeout);
            if (this.opts.autoUnref) {
                this.pingTimeoutTimer.unref();
            }
        }
        /**
         * Called on `drain` event
         *
         * @api private
         */
        onDrain() {
            this.writeBuffer.splice(0, this.prevBufferLen);
            // setting prevBufferLen = 0 is very important
            // for example, when upgrading, upgrade packet is sent over,
            // and a nonzero prevBufferLen could cause problems on `drain`
            this.prevBufferLen = 0;
            if (0 === this.writeBuffer.length) {
                this.emitReserved("drain");
            }
            else {
                this.flush();
            }
        }
        /**
         * Flush write buffers.
         *
         * @api private
         */
        flush() {
            if ("closed" !== this.readyState &&
                this.transport.writable &&
                !this.upgrading &&
                this.writeBuffer.length) {
                const packets = this.getWritablePackets();
                this.transport.send(packets);
                // keep track of current length of writeBuffer
                // splice writeBuffer and callbackBuffer on `drain`
                this.prevBufferLen = packets.length;
                this.emitReserved("flush");
            }
        }
        /**
         * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
         * long-polling)
         *
         * @private
         */
        getWritablePackets() {
            const shouldCheckPayloadSize = this.maxPayload &&
                this.transport.name === "polling" &&
                this.writeBuffer.length > 1;
            if (!shouldCheckPayloadSize) {
                return this.writeBuffer;
            }
            let payloadSize = 1; // first packet type
            for (let i = 0; i < this.writeBuffer.length; i++) {
                const data = this.writeBuffer[i].data;
                if (data) {
                    payloadSize += byteLength(data);
                }
                if (i > 0 && payloadSize > this.maxPayload) {
                    return this.writeBuffer.slice(0, i);
                }
                payloadSize += 2; // separator + packet type
            }
            return this.writeBuffer;
        }
        /**
         * Sends a message.
         *
         * @param {String} message.
         * @param {Function} callback function.
         * @param {Object} options.
         * @return {Socket} for chaining.
         * @api public
         */
        write(msg, options, fn) {
            this.sendPacket("message", msg, options, fn);
            return this;
        }
        send(msg, options, fn) {
            this.sendPacket("message", msg, options, fn);
            return this;
        }
        /**
         * Sends a packet.
         *
         * @param {String} packet type.
         * @param {String} data.
         * @param {Object} options.
         * @param {Function} callback function.
         * @api private
         */
        sendPacket(type, data, options, fn) {
            if ("function" === typeof data) {
                fn = data;
                data = undefined;
            }
            if ("function" === typeof options) {
                fn = options;
                options = null;
            }
            if ("closing" === this.readyState || "closed" === this.readyState) {
                return;
            }
            options = options || {};
            options.compress = false !== options.compress;
            const packet = {
                type: type,
                data: data,
                options: options
            };
            this.emitReserved("packetCreate", packet);
            this.writeBuffer.push(packet);
            if (fn)
                this.once("flush", fn);
            this.flush();
        }
        /**
         * Closes the connection.
         *
         * @api public
         */
        close() {
            const close = () => {
                this.onClose("forced close");
                this.transport.close();
            };
            const cleanupAndClose = () => {
                this.off("upgrade", cleanupAndClose);
                this.off("upgradeError", cleanupAndClose);
                close();
            };
            const waitForUpgrade = () => {
                // wait for upgrade to finish since we can't send packets while pausing a transport
                this.once("upgrade", cleanupAndClose);
                this.once("upgradeError", cleanupAndClose);
            };
            if ("opening" === this.readyState || "open" === this.readyState) {
                this.readyState = "closing";
                if (this.writeBuffer.length) {
                    this.once("drain", () => {
                        if (this.upgrading) {
                            waitForUpgrade();
                        }
                        else {
                            close();
                        }
                    });
                }
                else if (this.upgrading) {
                    waitForUpgrade();
                }
                else {
                    close();
                }
            }
            return this;
        }
        /**
         * Called upon transport error
         *
         * @api private
         */
        onError(err) {
            Socket$1.priorWebsocketSuccess = false;
            this.emitReserved("error", err);
            this.onClose("transport error", err);
        }
        /**
         * Called upon transport close.
         *
         * @api private
         */
        onClose(reason, description) {
            if ("opening" === this.readyState ||
                "open" === this.readyState ||
                "closing" === this.readyState) {
                // clear timers
                this.clearTimeoutFn(this.pingTimeoutTimer);
                // stop event from firing again for transport
                this.transport.removeAllListeners("close");
                // ensure transport won't stay open
                this.transport.close();
                // ignore further transport communication
                this.transport.removeAllListeners();
                if (typeof removeEventListener === "function") {
                    removeEventListener("offline", this.offlineEventListener, false);
                }
                // set ready state
                this.readyState = "closed";
                // clear session id
                this.id = null;
                // emit close event
                this.emitReserved("close", reason, description);
                // clean buffers after, so users can still
                // grab the buffers on `close` event
                this.writeBuffer = [];
                this.prevBufferLen = 0;
            }
        }
        /**
         * Filters upgrades, returning only those matching client transports.
         *
         * @param {Array} server upgrades
         * @api private
         *
         */
        filterUpgrades(upgrades) {
            const filteredUpgrades = [];
            let i = 0;
            const j = upgrades.length;
            for (; i < j; i++) {
                if (~this.transports.indexOf(upgrades[i]))
                    filteredUpgrades.push(upgrades[i]);
            }
            return filteredUpgrades;
        }
    }
    Socket$1.protocol = protocol$1;

    /**
     * URL parser.
     *
     * @param uri - url
     * @param path - the request path of the connection
     * @param loc - An object meant to mimic window.location.
     *        Defaults to window.location.
     * @public
     */
    function url(uri, path = "", loc) {
        let obj = uri;
        // default to window.location
        loc = loc || (typeof location !== "undefined" && location);
        if (null == uri)
            uri = loc.protocol + "//" + loc.host;
        // relative path support
        if (typeof uri === "string") {
            if ("/" === uri.charAt(0)) {
                if ("/" === uri.charAt(1)) {
                    uri = loc.protocol + uri;
                }
                else {
                    uri = loc.host + uri;
                }
            }
            if (!/^(https?|wss?):\/\//.test(uri)) {
                if ("undefined" !== typeof loc) {
                    uri = loc.protocol + "//" + uri;
                }
                else {
                    uri = "https://" + uri;
                }
            }
            // parse
            obj = parse(uri);
        }
        // make sure we treat `localhost:80` and `localhost` equally
        if (!obj.port) {
            if (/^(http|ws)$/.test(obj.protocol)) {
                obj.port = "80";
            }
            else if (/^(http|ws)s$/.test(obj.protocol)) {
                obj.port = "443";
            }
        }
        obj.path = obj.path || "/";
        const ipv6 = obj.host.indexOf(":") !== -1;
        const host = ipv6 ? "[" + obj.host + "]" : obj.host;
        // define unique id
        obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
        // define href
        obj.href =
            obj.protocol +
                "://" +
                host +
                (loc && loc.port === obj.port ? "" : ":" + obj.port);
        return obj;
    }

    const withNativeArrayBuffer = typeof ArrayBuffer === "function";
    const isView = (obj) => {
        return typeof ArrayBuffer.isView === "function"
            ? ArrayBuffer.isView(obj)
            : obj.buffer instanceof ArrayBuffer;
    };
    const toString = Object.prototype.toString;
    const withNativeBlob = typeof Blob === "function" ||
        (typeof Blob !== "undefined" &&
            toString.call(Blob) === "[object BlobConstructor]");
    const withNativeFile = typeof File === "function" ||
        (typeof File !== "undefined" &&
            toString.call(File) === "[object FileConstructor]");
    /**
     * Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
     *
     * @private
     */
    function isBinary(obj) {
        return ((withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj))) ||
            (withNativeBlob && obj instanceof Blob) ||
            (withNativeFile && obj instanceof File));
    }
    function hasBinary(obj, toJSON) {
        if (!obj || typeof obj !== "object") {
            return false;
        }
        if (Array.isArray(obj)) {
            for (let i = 0, l = obj.length; i < l; i++) {
                if (hasBinary(obj[i])) {
                    return true;
                }
            }
            return false;
        }
        if (isBinary(obj)) {
            return true;
        }
        if (obj.toJSON &&
            typeof obj.toJSON === "function" &&
            arguments.length === 1) {
            return hasBinary(obj.toJSON(), true);
        }
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Replaces every Buffer | ArrayBuffer | Blob | File in packet with a numbered placeholder.
     *
     * @param {Object} packet - socket.io event packet
     * @return {Object} with deconstructed packet and list of buffers
     * @public
     */
    function deconstructPacket(packet) {
        const buffers = [];
        const packetData = packet.data;
        const pack = packet;
        pack.data = _deconstructPacket(packetData, buffers);
        pack.attachments = buffers.length; // number of binary 'attachments'
        return { packet: pack, buffers: buffers };
    }
    function _deconstructPacket(data, buffers) {
        if (!data)
            return data;
        if (isBinary(data)) {
            const placeholder = { _placeholder: true, num: buffers.length };
            buffers.push(data);
            return placeholder;
        }
        else if (Array.isArray(data)) {
            const newData = new Array(data.length);
            for (let i = 0; i < data.length; i++) {
                newData[i] = _deconstructPacket(data[i], buffers);
            }
            return newData;
        }
        else if (typeof data === "object" && !(data instanceof Date)) {
            const newData = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    newData[key] = _deconstructPacket(data[key], buffers);
                }
            }
            return newData;
        }
        return data;
    }
    /**
     * Reconstructs a binary packet from its placeholder packet and buffers
     *
     * @param {Object} packet - event packet with placeholders
     * @param {Array} buffers - binary buffers to put in placeholder positions
     * @return {Object} reconstructed packet
     * @public
     */
    function reconstructPacket(packet, buffers) {
        packet.data = _reconstructPacket(packet.data, buffers);
        packet.attachments = undefined; // no longer useful
        return packet;
    }
    function _reconstructPacket(data, buffers) {
        if (!data)
            return data;
        if (data && data._placeholder) {
            return buffers[data.num]; // appropriate buffer (should be natural order anyway)
        }
        else if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                data[i] = _reconstructPacket(data[i], buffers);
            }
        }
        else if (typeof data === "object") {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    data[key] = _reconstructPacket(data[key], buffers);
                }
            }
        }
        return data;
    }

    /**
     * Protocol version.
     *
     * @public
     */
    const protocol = 5;
    var PacketType;
    (function (PacketType) {
        PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
        PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
        PacketType[PacketType["EVENT"] = 2] = "EVENT";
        PacketType[PacketType["ACK"] = 3] = "ACK";
        PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
        PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
        PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
    })(PacketType || (PacketType = {}));
    /**
     * A socket.io Encoder instance
     */
    class Encoder {
        /**
         * Encoder constructor
         *
         * @param {function} replacer - custom replacer to pass down to JSON.parse
         */
        constructor(replacer) {
            this.replacer = replacer;
        }
        /**
         * Encode a packet as a single string if non-binary, or as a
         * buffer sequence, depending on packet type.
         *
         * @param {Object} obj - packet object
         */
        encode(obj) {
            if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
                if (hasBinary(obj)) {
                    obj.type =
                        obj.type === PacketType.EVENT
                            ? PacketType.BINARY_EVENT
                            : PacketType.BINARY_ACK;
                    return this.encodeAsBinary(obj);
                }
            }
            return [this.encodeAsString(obj)];
        }
        /**
         * Encode packet as string.
         */
        encodeAsString(obj) {
            // first is type
            let str = "" + obj.type;
            // attachments if we have them
            if (obj.type === PacketType.BINARY_EVENT ||
                obj.type === PacketType.BINARY_ACK) {
                str += obj.attachments + "-";
            }
            // if we have a namespace other than `/`
            // we append it followed by a comma `,`
            if (obj.nsp && "/" !== obj.nsp) {
                str += obj.nsp + ",";
            }
            // immediately followed by the id
            if (null != obj.id) {
                str += obj.id;
            }
            // json data
            if (null != obj.data) {
                str += JSON.stringify(obj.data, this.replacer);
            }
            return str;
        }
        /**
         * Encode packet as 'buffer sequence' by removing blobs, and
         * deconstructing packet into object with placeholders and
         * a list of buffers.
         */
        encodeAsBinary(obj) {
            const deconstruction = deconstructPacket(obj);
            const pack = this.encodeAsString(deconstruction.packet);
            const buffers = deconstruction.buffers;
            buffers.unshift(pack); // add packet info to beginning of data list
            return buffers; // write all the buffers
        }
    }
    /**
     * A socket.io Decoder instance
     *
     * @return {Object} decoder
     */
    class Decoder extends Emitter {
        /**
         * Decoder constructor
         *
         * @param {function} reviver - custom reviver to pass down to JSON.stringify
         */
        constructor(reviver) {
            super();
            this.reviver = reviver;
        }
        /**
         * Decodes an encoded packet string into packet JSON.
         *
         * @param {String} obj - encoded packet
         */
        add(obj) {
            let packet;
            if (typeof obj === "string") {
                packet = this.decodeString(obj);
                if (packet.type === PacketType.BINARY_EVENT ||
                    packet.type === PacketType.BINARY_ACK) {
                    // binary packet's json
                    this.reconstructor = new BinaryReconstructor(packet);
                    // no attachments, labeled binary but no binary data to follow
                    if (packet.attachments === 0) {
                        super.emitReserved("decoded", packet);
                    }
                }
                else {
                    // non-binary full packet
                    super.emitReserved("decoded", packet);
                }
            }
            else if (isBinary(obj) || obj.base64) {
                // raw binary data
                if (!this.reconstructor) {
                    throw new Error("got binary data when not reconstructing a packet");
                }
                else {
                    packet = this.reconstructor.takeBinaryData(obj);
                    if (packet) {
                        // received final buffer
                        this.reconstructor = null;
                        super.emitReserved("decoded", packet);
                    }
                }
            }
            else {
                throw new Error("Unknown type: " + obj);
            }
        }
        /**
         * Decode a packet String (JSON data)
         *
         * @param {String} str
         * @return {Object} packet
         */
        decodeString(str) {
            let i = 0;
            // look up type
            const p = {
                type: Number(str.charAt(0)),
            };
            if (PacketType[p.type] === undefined) {
                throw new Error("unknown packet type " + p.type);
            }
            // look up attachments if type binary
            if (p.type === PacketType.BINARY_EVENT ||
                p.type === PacketType.BINARY_ACK) {
                const start = i + 1;
                while (str.charAt(++i) !== "-" && i != str.length) { }
                const buf = str.substring(start, i);
                if (buf != Number(buf) || str.charAt(i) !== "-") {
                    throw new Error("Illegal attachments");
                }
                p.attachments = Number(buf);
            }
            // look up namespace (if any)
            if ("/" === str.charAt(i + 1)) {
                const start = i + 1;
                while (++i) {
                    const c = str.charAt(i);
                    if ("," === c)
                        break;
                    if (i === str.length)
                        break;
                }
                p.nsp = str.substring(start, i);
            }
            else {
                p.nsp = "/";
            }
            // look up id
            const next = str.charAt(i + 1);
            if ("" !== next && Number(next) == next) {
                const start = i + 1;
                while (++i) {
                    const c = str.charAt(i);
                    if (null == c || Number(c) != c) {
                        --i;
                        break;
                    }
                    if (i === str.length)
                        break;
                }
                p.id = Number(str.substring(start, i + 1));
            }
            // look up json data
            if (str.charAt(++i)) {
                const payload = this.tryParse(str.substr(i));
                if (Decoder.isPayloadValid(p.type, payload)) {
                    p.data = payload;
                }
                else {
                    throw new Error("invalid payload");
                }
            }
            return p;
        }
        tryParse(str) {
            try {
                return JSON.parse(str, this.reviver);
            }
            catch (e) {
                return false;
            }
        }
        static isPayloadValid(type, payload) {
            switch (type) {
                case PacketType.CONNECT:
                    return typeof payload === "object";
                case PacketType.DISCONNECT:
                    return payload === undefined;
                case PacketType.CONNECT_ERROR:
                    return typeof payload === "string" || typeof payload === "object";
                case PacketType.EVENT:
                case PacketType.BINARY_EVENT:
                    return Array.isArray(payload) && payload.length > 0;
                case PacketType.ACK:
                case PacketType.BINARY_ACK:
                    return Array.isArray(payload);
            }
        }
        /**
         * Deallocates a parser's resources
         */
        destroy() {
            if (this.reconstructor) {
                this.reconstructor.finishedReconstruction();
            }
        }
    }
    /**
     * A manager of a binary event's 'buffer sequence'. Should
     * be constructed whenever a packet of type BINARY_EVENT is
     * decoded.
     *
     * @param {Object} packet
     * @return {BinaryReconstructor} initialized reconstructor
     */
    class BinaryReconstructor {
        constructor(packet) {
            this.packet = packet;
            this.buffers = [];
            this.reconPack = packet;
        }
        /**
         * Method to be called when binary data received from connection
         * after a BINARY_EVENT packet.
         *
         * @param {Buffer | ArrayBuffer} binData - the raw binary data received
         * @return {null | Object} returns null if more binary data is expected or
         *   a reconstructed packet object if all buffers have been received.
         */
        takeBinaryData(binData) {
            this.buffers.push(binData);
            if (this.buffers.length === this.reconPack.attachments) {
                // done with buffer list
                const packet = reconstructPacket(this.reconPack, this.buffers);
                this.finishedReconstruction();
                return packet;
            }
            return null;
        }
        /**
         * Cleans up binary packet reconstruction variables.
         */
        finishedReconstruction() {
            this.reconPack = null;
            this.buffers = [];
        }
    }

    var parser = /*#__PURE__*/Object.freeze({
        __proto__: null,
        protocol: protocol,
        get PacketType () { return PacketType; },
        Encoder: Encoder,
        Decoder: Decoder
    });

    function on(obj, ev, fn) {
        obj.on(ev, fn);
        return function subDestroy() {
            obj.off(ev, fn);
        };
    }

    /**
     * Internal events.
     * These events can't be emitted by the user.
     */
    const RESERVED_EVENTS = Object.freeze({
        connect: 1,
        connect_error: 1,
        disconnect: 1,
        disconnecting: 1,
        // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
        newListener: 1,
        removeListener: 1,
    });
    class Socket extends Emitter {
        /**
         * `Socket` constructor.
         *
         * @public
         */
        constructor(io, nsp, opts) {
            super();
            this.connected = false;
            this.receiveBuffer = [];
            this.sendBuffer = [];
            this.ids = 0;
            this.acks = {};
            this.flags = {};
            this.io = io;
            this.nsp = nsp;
            if (opts && opts.auth) {
                this.auth = opts.auth;
            }
            if (this.io._autoConnect)
                this.open();
        }
        /**
         * Whether the socket is currently disconnected
         */
        get disconnected() {
            return !this.connected;
        }
        /**
         * Subscribe to open, close and packet events
         *
         * @private
         */
        subEvents() {
            if (this.subs)
                return;
            const io = this.io;
            this.subs = [
                on(io, "open", this.onopen.bind(this)),
                on(io, "packet", this.onpacket.bind(this)),
                on(io, "error", this.onerror.bind(this)),
                on(io, "close", this.onclose.bind(this)),
            ];
        }
        /**
         * Whether the Socket will try to reconnect when its Manager connects or reconnects
         */
        get active() {
            return !!this.subs;
        }
        /**
         * "Opens" the socket.
         *
         * @public
         */
        connect() {
            if (this.connected)
                return this;
            this.subEvents();
            if (!this.io["_reconnecting"])
                this.io.open(); // ensure open
            if ("open" === this.io._readyState)
                this.onopen();
            return this;
        }
        /**
         * Alias for connect()
         */
        open() {
            return this.connect();
        }
        /**
         * Sends a `message` event.
         *
         * @return self
         * @public
         */
        send(...args) {
            args.unshift("message");
            this.emit.apply(this, args);
            return this;
        }
        /**
         * Override `emit`.
         * If the event is in `events`, it's emitted normally.
         *
         * @return self
         * @public
         */
        emit(ev, ...args) {
            if (RESERVED_EVENTS.hasOwnProperty(ev)) {
                throw new Error('"' + ev + '" is a reserved event name');
            }
            args.unshift(ev);
            const packet = {
                type: PacketType.EVENT,
                data: args,
            };
            packet.options = {};
            packet.options.compress = this.flags.compress !== false;
            // event ack callback
            if ("function" === typeof args[args.length - 1]) {
                const id = this.ids++;
                const ack = args.pop();
                this._registerAckCallback(id, ack);
                packet.id = id;
            }
            const isTransportWritable = this.io.engine &&
                this.io.engine.transport &&
                this.io.engine.transport.writable;
            const discardPacket = this.flags.volatile && (!isTransportWritable || !this.connected);
            if (discardPacket) ;
            else if (this.connected) {
                this.notifyOutgoingListeners(packet);
                this.packet(packet);
            }
            else {
                this.sendBuffer.push(packet);
            }
            this.flags = {};
            return this;
        }
        /**
         * @private
         */
        _registerAckCallback(id, ack) {
            const timeout = this.flags.timeout;
            if (timeout === undefined) {
                this.acks[id] = ack;
                return;
            }
            // @ts-ignore
            const timer = this.io.setTimeoutFn(() => {
                delete this.acks[id];
                for (let i = 0; i < this.sendBuffer.length; i++) {
                    if (this.sendBuffer[i].id === id) {
                        this.sendBuffer.splice(i, 1);
                    }
                }
                ack.call(this, new Error("operation has timed out"));
            }, timeout);
            this.acks[id] = (...args) => {
                // @ts-ignore
                this.io.clearTimeoutFn(timer);
                ack.apply(this, [null, ...args]);
            };
        }
        /**
         * Sends a packet.
         *
         * @param packet
         * @private
         */
        packet(packet) {
            packet.nsp = this.nsp;
            this.io._packet(packet);
        }
        /**
         * Called upon engine `open`.
         *
         * @private
         */
        onopen() {
            if (typeof this.auth == "function") {
                this.auth((data) => {
                    this.packet({ type: PacketType.CONNECT, data });
                });
            }
            else {
                this.packet({ type: PacketType.CONNECT, data: this.auth });
            }
        }
        /**
         * Called upon engine or manager `error`.
         *
         * @param err
         * @private
         */
        onerror(err) {
            if (!this.connected) {
                this.emitReserved("connect_error", err);
            }
        }
        /**
         * Called upon engine `close`.
         *
         * @param reason
         * @param description
         * @private
         */
        onclose(reason, description) {
            this.connected = false;
            delete this.id;
            this.emitReserved("disconnect", reason, description);
        }
        /**
         * Called with socket packet.
         *
         * @param packet
         * @private
         */
        onpacket(packet) {
            const sameNamespace = packet.nsp === this.nsp;
            if (!sameNamespace)
                return;
            switch (packet.type) {
                case PacketType.CONNECT:
                    if (packet.data && packet.data.sid) {
                        const id = packet.data.sid;
                        this.onconnect(id);
                    }
                    else {
                        this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                    }
                    break;
                case PacketType.EVENT:
                case PacketType.BINARY_EVENT:
                    this.onevent(packet);
                    break;
                case PacketType.ACK:
                case PacketType.BINARY_ACK:
                    this.onack(packet);
                    break;
                case PacketType.DISCONNECT:
                    this.ondisconnect();
                    break;
                case PacketType.CONNECT_ERROR:
                    this.destroy();
                    const err = new Error(packet.data.message);
                    // @ts-ignore
                    err.data = packet.data.data;
                    this.emitReserved("connect_error", err);
                    break;
            }
        }
        /**
         * Called upon a server event.
         *
         * @param packet
         * @private
         */
        onevent(packet) {
            const args = packet.data || [];
            if (null != packet.id) {
                args.push(this.ack(packet.id));
            }
            if (this.connected) {
                this.emitEvent(args);
            }
            else {
                this.receiveBuffer.push(Object.freeze(args));
            }
        }
        emitEvent(args) {
            if (this._anyListeners && this._anyListeners.length) {
                const listeners = this._anyListeners.slice();
                for (const listener of listeners) {
                    listener.apply(this, args);
                }
            }
            super.emit.apply(this, args);
        }
        /**
         * Produces an ack callback to emit with an event.
         *
         * @private
         */
        ack(id) {
            const self = this;
            let sent = false;
            return function (...args) {
                // prevent double callbacks
                if (sent)
                    return;
                sent = true;
                self.packet({
                    type: PacketType.ACK,
                    id: id,
                    data: args,
                });
            };
        }
        /**
         * Called upon a server acknowlegement.
         *
         * @param packet
         * @private
         */
        onack(packet) {
            const ack = this.acks[packet.id];
            if ("function" === typeof ack) {
                ack.apply(this, packet.data);
                delete this.acks[packet.id];
            }
        }
        /**
         * Called upon server connect.
         *
         * @private
         */
        onconnect(id) {
            this.id = id;
            this.connected = true;
            this.emitBuffered();
            this.emitReserved("connect");
        }
        /**
         * Emit buffered events (received and emitted).
         *
         * @private
         */
        emitBuffered() {
            this.receiveBuffer.forEach((args) => this.emitEvent(args));
            this.receiveBuffer = [];
            this.sendBuffer.forEach((packet) => {
                this.notifyOutgoingListeners(packet);
                this.packet(packet);
            });
            this.sendBuffer = [];
        }
        /**
         * Called upon server disconnect.
         *
         * @private
         */
        ondisconnect() {
            this.destroy();
            this.onclose("io server disconnect");
        }
        /**
         * Called upon forced client/server side disconnections,
         * this method ensures the manager stops tracking us and
         * that reconnections don't get triggered for this.
         *
         * @private
         */
        destroy() {
            if (this.subs) {
                // clean subscriptions to avoid reconnections
                this.subs.forEach((subDestroy) => subDestroy());
                this.subs = undefined;
            }
            this.io["_destroy"](this);
        }
        /**
         * Disconnects the socket manually.
         *
         * @return self
         * @public
         */
        disconnect() {
            if (this.connected) {
                this.packet({ type: PacketType.DISCONNECT });
            }
            // remove socket from pool
            this.destroy();
            if (this.connected) {
                // fire events
                this.onclose("io client disconnect");
            }
            return this;
        }
        /**
         * Alias for disconnect()
         *
         * @return self
         * @public
         */
        close() {
            return this.disconnect();
        }
        /**
         * Sets the compress flag.
         *
         * @param compress - if `true`, compresses the sending data
         * @return self
         * @public
         */
        compress(compress) {
            this.flags.compress = compress;
            return this;
        }
        /**
         * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
         * ready to send messages.
         *
         * @returns self
         * @public
         */
        get volatile() {
            this.flags.volatile = true;
            return this;
        }
        /**
         * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
         * given number of milliseconds have elapsed without an acknowledgement from the server:
         *
         * ```
         * socket.timeout(5000).emit("my-event", (err) => {
         *   if (err) {
         *     // the server did not acknowledge the event in the given delay
         *   }
         * });
         * ```
         *
         * @returns self
         * @public
         */
        timeout(timeout) {
            this.flags.timeout = timeout;
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback.
         *
         * @param listener
         * @public
         */
        onAny(listener) {
            this._anyListeners = this._anyListeners || [];
            this._anyListeners.push(listener);
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback. The listener is added to the beginning of the listeners array.
         *
         * @param listener
         * @public
         */
        prependAny(listener) {
            this._anyListeners = this._anyListeners || [];
            this._anyListeners.unshift(listener);
            return this;
        }
        /**
         * Removes the listener that will be fired when any event is emitted.
         *
         * @param listener
         * @public
         */
        offAny(listener) {
            if (!this._anyListeners) {
                return this;
            }
            if (listener) {
                const listeners = this._anyListeners;
                for (let i = 0; i < listeners.length; i++) {
                    if (listener === listeners[i]) {
                        listeners.splice(i, 1);
                        return this;
                    }
                }
            }
            else {
                this._anyListeners = [];
            }
            return this;
        }
        /**
         * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
         * e.g. to remove listeners.
         *
         * @public
         */
        listenersAny() {
            return this._anyListeners || [];
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback.
         *
         * @param listener
         *
         * <pre><code>
         *
         * socket.onAnyOutgoing((event, ...args) => {
         *   console.log(event);
         * });
         *
         * </pre></code>
         *
         * @public
         */
        onAnyOutgoing(listener) {
            this._anyOutgoingListeners = this._anyOutgoingListeners || [];
            this._anyOutgoingListeners.push(listener);
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback. The listener is added to the beginning of the listeners array.
         *
         * @param listener
         *
         * <pre><code>
         *
         * socket.prependAnyOutgoing((event, ...args) => {
         *   console.log(event);
         * });
         *
         * </pre></code>
         *
         * @public
         */
        prependAnyOutgoing(listener) {
            this._anyOutgoingListeners = this._anyOutgoingListeners || [];
            this._anyOutgoingListeners.unshift(listener);
            return this;
        }
        /**
         * Removes the listener that will be fired when any event is emitted.
         *
         * @param listener
         *
         * <pre><code>
         *
         * const handler = (event, ...args) => {
         *   console.log(event);
         * }
         *
         * socket.onAnyOutgoing(handler);
         *
         * // then later
         * socket.offAnyOutgoing(handler);
         *
         * </pre></code>
         *
         * @public
         */
        offAnyOutgoing(listener) {
            if (!this._anyOutgoingListeners) {
                return this;
            }
            if (listener) {
                const listeners = this._anyOutgoingListeners;
                for (let i = 0; i < listeners.length; i++) {
                    if (listener === listeners[i]) {
                        listeners.splice(i, 1);
                        return this;
                    }
                }
            }
            else {
                this._anyOutgoingListeners = [];
            }
            return this;
        }
        /**
         * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
         * e.g. to remove listeners.
         *
         * @public
         */
        listenersAnyOutgoing() {
            return this._anyOutgoingListeners || [];
        }
        /**
         * Notify the listeners for each packet sent
         *
         * @param packet
         *
         * @private
         */
        notifyOutgoingListeners(packet) {
            if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
                const listeners = this._anyOutgoingListeners.slice();
                for (const listener of listeners) {
                    listener.apply(this, packet.data);
                }
            }
        }
    }

    /**
     * Initialize backoff timer with `opts`.
     *
     * - `min` initial timeout in milliseconds [100]
     * - `max` max timeout [10000]
     * - `jitter` [0]
     * - `factor` [2]
     *
     * @param {Object} opts
     * @api public
     */
    function Backoff(opts) {
        opts = opts || {};
        this.ms = opts.min || 100;
        this.max = opts.max || 10000;
        this.factor = opts.factor || 2;
        this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
        this.attempts = 0;
    }
    /**
     * Return the backoff duration.
     *
     * @return {Number}
     * @api public
     */
    Backoff.prototype.duration = function () {
        var ms = this.ms * Math.pow(this.factor, this.attempts++);
        if (this.jitter) {
            var rand = Math.random();
            var deviation = Math.floor(rand * this.jitter * ms);
            ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
        }
        return Math.min(ms, this.max) | 0;
    };
    /**
     * Reset the number of attempts.
     *
     * @api public
     */
    Backoff.prototype.reset = function () {
        this.attempts = 0;
    };
    /**
     * Set the minimum duration
     *
     * @api public
     */
    Backoff.prototype.setMin = function (min) {
        this.ms = min;
    };
    /**
     * Set the maximum duration
     *
     * @api public
     */
    Backoff.prototype.setMax = function (max) {
        this.max = max;
    };
    /**
     * Set the jitter
     *
     * @api public
     */
    Backoff.prototype.setJitter = function (jitter) {
        this.jitter = jitter;
    };

    class Manager extends Emitter {
        constructor(uri, opts) {
            var _a;
            super();
            this.nsps = {};
            this.subs = [];
            if (uri && "object" === typeof uri) {
                opts = uri;
                uri = undefined;
            }
            opts = opts || {};
            opts.path = opts.path || "/socket.io";
            this.opts = opts;
            installTimerFunctions(this, opts);
            this.reconnection(opts.reconnection !== false);
            this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
            this.reconnectionDelay(opts.reconnectionDelay || 1000);
            this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
            this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
            this.backoff = new Backoff({
                min: this.reconnectionDelay(),
                max: this.reconnectionDelayMax(),
                jitter: this.randomizationFactor(),
            });
            this.timeout(null == opts.timeout ? 20000 : opts.timeout);
            this._readyState = "closed";
            this.uri = uri;
            const _parser = opts.parser || parser;
            this.encoder = new _parser.Encoder();
            this.decoder = new _parser.Decoder();
            this._autoConnect = opts.autoConnect !== false;
            if (this._autoConnect)
                this.open();
        }
        reconnection(v) {
            if (!arguments.length)
                return this._reconnection;
            this._reconnection = !!v;
            return this;
        }
        reconnectionAttempts(v) {
            if (v === undefined)
                return this._reconnectionAttempts;
            this._reconnectionAttempts = v;
            return this;
        }
        reconnectionDelay(v) {
            var _a;
            if (v === undefined)
                return this._reconnectionDelay;
            this._reconnectionDelay = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
            return this;
        }
        randomizationFactor(v) {
            var _a;
            if (v === undefined)
                return this._randomizationFactor;
            this._randomizationFactor = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
            return this;
        }
        reconnectionDelayMax(v) {
            var _a;
            if (v === undefined)
                return this._reconnectionDelayMax;
            this._reconnectionDelayMax = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
            return this;
        }
        timeout(v) {
            if (!arguments.length)
                return this._timeout;
            this._timeout = v;
            return this;
        }
        /**
         * Starts trying to reconnect if reconnection is enabled and we have not
         * started reconnecting yet
         *
         * @private
         */
        maybeReconnectOnOpen() {
            // Only try to reconnect if it's the first time we're connecting
            if (!this._reconnecting &&
                this._reconnection &&
                this.backoff.attempts === 0) {
                // keeps reconnection from firing twice for the same reconnection loop
                this.reconnect();
            }
        }
        /**
         * Sets the current transport `socket`.
         *
         * @param {Function} fn - optional, callback
         * @return self
         * @public
         */
        open(fn) {
            if (~this._readyState.indexOf("open"))
                return this;
            this.engine = new Socket$1(this.uri, this.opts);
            const socket = this.engine;
            const self = this;
            this._readyState = "opening";
            this.skipReconnect = false;
            // emit `open`
            const openSubDestroy = on(socket, "open", function () {
                self.onopen();
                fn && fn();
            });
            // emit `error`
            const errorSub = on(socket, "error", (err) => {
                self.cleanup();
                self._readyState = "closed";
                this.emitReserved("error", err);
                if (fn) {
                    fn(err);
                }
                else {
                    // Only do this if there is no fn to handle the error
                    self.maybeReconnectOnOpen();
                }
            });
            if (false !== this._timeout) {
                const timeout = this._timeout;
                if (timeout === 0) {
                    openSubDestroy(); // prevents a race condition with the 'open' event
                }
                // set timer
                const timer = this.setTimeoutFn(() => {
                    openSubDestroy();
                    socket.close();
                    // @ts-ignore
                    socket.emit("error", new Error("timeout"));
                }, timeout);
                if (this.opts.autoUnref) {
                    timer.unref();
                }
                this.subs.push(function subDestroy() {
                    clearTimeout(timer);
                });
            }
            this.subs.push(openSubDestroy);
            this.subs.push(errorSub);
            return this;
        }
        /**
         * Alias for open()
         *
         * @return self
         * @public
         */
        connect(fn) {
            return this.open(fn);
        }
        /**
         * Called upon transport open.
         *
         * @private
         */
        onopen() {
            // clear old subs
            this.cleanup();
            // mark as open
            this._readyState = "open";
            this.emitReserved("open");
            // add new subs
            const socket = this.engine;
            this.subs.push(on(socket, "ping", this.onping.bind(this)), on(socket, "data", this.ondata.bind(this)), on(socket, "error", this.onerror.bind(this)), on(socket, "close", this.onclose.bind(this)), on(this.decoder, "decoded", this.ondecoded.bind(this)));
        }
        /**
         * Called upon a ping.
         *
         * @private
         */
        onping() {
            this.emitReserved("ping");
        }
        /**
         * Called with data.
         *
         * @private
         */
        ondata(data) {
            this.decoder.add(data);
        }
        /**
         * Called when parser fully decodes a packet.
         *
         * @private
         */
        ondecoded(packet) {
            this.emitReserved("packet", packet);
        }
        /**
         * Called upon socket error.
         *
         * @private
         */
        onerror(err) {
            this.emitReserved("error", err);
        }
        /**
         * Creates a new socket for the given `nsp`.
         *
         * @return {Socket}
         * @public
         */
        socket(nsp, opts) {
            let socket = this.nsps[nsp];
            if (!socket) {
                socket = new Socket(this, nsp, opts);
                this.nsps[nsp] = socket;
            }
            return socket;
        }
        /**
         * Called upon a socket close.
         *
         * @param socket
         * @private
         */
        _destroy(socket) {
            const nsps = Object.keys(this.nsps);
            for (const nsp of nsps) {
                const socket = this.nsps[nsp];
                if (socket.active) {
                    return;
                }
            }
            this._close();
        }
        /**
         * Writes a packet.
         *
         * @param packet
         * @private
         */
        _packet(packet) {
            const encodedPackets = this.encoder.encode(packet);
            for (let i = 0; i < encodedPackets.length; i++) {
                this.engine.write(encodedPackets[i], packet.options);
            }
        }
        /**
         * Clean up transport subscriptions and packet buffer.
         *
         * @private
         */
        cleanup() {
            this.subs.forEach((subDestroy) => subDestroy());
            this.subs.length = 0;
            this.decoder.destroy();
        }
        /**
         * Close the current socket.
         *
         * @private
         */
        _close() {
            this.skipReconnect = true;
            this._reconnecting = false;
            this.onclose("forced close");
            if (this.engine)
                this.engine.close();
        }
        /**
         * Alias for close()
         *
         * @private
         */
        disconnect() {
            return this._close();
        }
        /**
         * Called upon engine close.
         *
         * @private
         */
        onclose(reason, description) {
            this.cleanup();
            this.backoff.reset();
            this._readyState = "closed";
            this.emitReserved("close", reason, description);
            if (this._reconnection && !this.skipReconnect) {
                this.reconnect();
            }
        }
        /**
         * Attempt a reconnection.
         *
         * @private
         */
        reconnect() {
            if (this._reconnecting || this.skipReconnect)
                return this;
            const self = this;
            if (this.backoff.attempts >= this._reconnectionAttempts) {
                this.backoff.reset();
                this.emitReserved("reconnect_failed");
                this._reconnecting = false;
            }
            else {
                const delay = this.backoff.duration();
                this._reconnecting = true;
                const timer = this.setTimeoutFn(() => {
                    if (self.skipReconnect)
                        return;
                    this.emitReserved("reconnect_attempt", self.backoff.attempts);
                    // check again for the case socket closed in above events
                    if (self.skipReconnect)
                        return;
                    self.open((err) => {
                        if (err) {
                            self._reconnecting = false;
                            self.reconnect();
                            this.emitReserved("reconnect_error", err);
                        }
                        else {
                            self.onreconnect();
                        }
                    });
                }, delay);
                if (this.opts.autoUnref) {
                    timer.unref();
                }
                this.subs.push(function subDestroy() {
                    clearTimeout(timer);
                });
            }
        }
        /**
         * Called upon successful reconnect.
         *
         * @private
         */
        onreconnect() {
            const attempt = this.backoff.attempts;
            this._reconnecting = false;
            this.backoff.reset();
            this.emitReserved("reconnect", attempt);
        }
    }

    /**
     * Managers cache.
     */
    const cache = {};
    function lookup(uri, opts) {
        if (typeof uri === "object") {
            opts = uri;
            uri = undefined;
        }
        opts = opts || {};
        const parsed = url(uri, opts.path || "/socket.io");
        const source = parsed.source;
        const id = parsed.id;
        const path = parsed.path;
        const sameNamespace = cache[id] && path in cache[id]["nsps"];
        const newConnection = opts.forceNew ||
            opts["force new connection"] ||
            false === opts.multiplex ||
            sameNamespace;
        let io;
        if (newConnection) {
            io = new Manager(source, opts);
        }
        else {
            if (!cache[id]) {
                cache[id] = new Manager(source, opts);
            }
            io = cache[id];
        }
        if (parsed.query && !opts.query) {
            opts.query = parsed.queryKey;
        }
        return io.socket(parsed.path, opts);
    }
    // so that "lookup" can be used both as a function (e.g. `io(...)`) and as a
    // namespace (e.g. `io.connect(...)`), for backward compatibility
    Object.assign(lookup, {
        Manager,
        Socket,
        io: lookup,
        connect: lookup,
    });

    const useSocket = (url) => {
        const socket = lookup(url);
        return socket;
    };

    /* src\components\NotLogged.svelte generated by Svelte v3.48.0 */
    const file$f = "src\\components\\NotLogged.svelte";

    function create_fragment$l(ctx) {
    	let main;
    	let button;
    	let t;
    	let span;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			button = element("button");
    			t = text("Login with Gruzservices\r\n    ");
    			span = element("span");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "https://auth.gruzservices.com/icons/lock.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Lock");
    			add_location(img, file$f, 69, 6, 2023);
    			attr_dev(span, "class", "svelte-1tk6uk1");
    			add_location(span, file$f, 68, 4, 2009);
    			attr_dev(button, "id", "sauth-login");
    			attr_dev(button, "class", "svelte-1tk6uk1");
    			add_location(button, file$f, 66, 2, 1922);
    			attr_dev(main, "class", "svelte-1tk6uk1");
    			add_location(main, file$f, 65, 0, 1912);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, button);
    			append_dev(button, t);
    			append_dev(button, span);
    			append_dev(span, img);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotLogged', slots, []);
    	let { PROXY } = $$props;
    	const dispatch = createEventDispatcher();
    	const navigate = useNavigate();
    	const socket = useSocket(PROXY);

    	const popupCenter = ({ postServer, key, title, w, h }) => {
    		// Fixes dual-screen position                             Most browsers      Firefox
    		const dualScreenLeft = window.screenLeft !== undefined
    		? window.screenLeft
    		: window.screenX;

    		const dualScreenTop = window.screenTop !== undefined
    		? window.screenTop
    		: window.screenY;

    		const url = `https://auth.gruzservices.com/auth?website=${postServer}&key=${key}`;

    		const width = window.innerWidth
    		? window.innerWidth
    		: document.documentElement.clientWidth
    			? document.documentElement.clientWidth
    			: 100;

    		const height = window.innerHeight
    		? window.innerHeight
    		: document.documentElement.clientHeight
    			? document.documentElement.clientHeight
    			: 100;

    		const systemZoom = width / window.screen.availWidth;
    		const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    		const top = (height - h) / 2 / systemZoom + dualScreenTop;

    		const newWindow = window.open(url, title, `
    scrollbars=yes,
    width=${w / systemZoom}, 
    height=${h / systemZoom}, 
    top=${top}, 
    left=${left}
    `);

    		if (window.focus) {
    			newWindow.focus();
    		}
    	};

    	const loginIt = () => {
    		socket.on("auth", data => {
    			socket.off("auth");
    			document.cookie = `G_VAR2=${data.token}`;
    			dispatch("userLoggedIn", data.userData);
    		});

    		popupCenter({
    			postServer: `${PROXY}auth`,
    			key: socket.id,
    			title: "Authenticate",
    			w: 520,
    			h: 570
    		});
    	};

    	const writable_props = ['PROXY'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotLogged> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => loginIt();

    	$$self.$$set = $$props => {
    		if ('PROXY' in $$props) $$invalidate(1, PROXY = $$props.PROXY);
    	};

    	$$self.$capture_state = () => ({
    		useNavigate,
    		createEventDispatcher,
    		useSocket,
    		PROXY,
    		dispatch,
    		navigate,
    		socket,
    		popupCenter,
    		loginIt
    	});

    	$$self.$inject_state = $$props => {
    		if ('PROXY' in $$props) $$invalidate(1, PROXY = $$props.PROXY);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loginIt, PROXY, click_handler];
    }

    class NotLogged extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { PROXY: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotLogged",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*PROXY*/ ctx[1] === undefined && !('PROXY' in props)) {
    			console.warn("<NotLogged> was created without expected prop 'PROXY'");
    		}
    	}

    	get PROXY() {
    		throw new Error("<NotLogged>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set PROXY(value) {
    		throw new Error("<NotLogged>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ToastNotification.svelte generated by Svelte v3.48.0 */
    const file$e = "src\\components\\ToastNotification.svelte";

    function create_fragment$k(ctx) {
    	let div1;
    	let div0;
    	let p;
    	let t0;
    	let button;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			button = element("button");
    			button.textContent = "✖";
    			attr_dev(p, "class", "svelte-17b7m0a");
    			add_location(p, file$e, 12, 4, 296);
    			attr_dev(button, "class", "svelte-17b7m0a");
    			add_location(button, file$e, 13, 4, 317);
    			attr_dev(div0, "class", "notification-toast-inner svelte-17b7m0a");
    			add_location(div0, file$e, 11, 2, 252);
    			attr_dev(div1, "class", div1_class_value = "notification-toast " + /*type*/ ctx[0] + " svelte-17b7m0a");
    			add_location(div1, file$e, 10, 0, 209);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p);

    			if (default_slot) {
    				default_slot.m(p, null);
    			}

    			append_dev(div0, t0);
    			append_dev(div0, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClose*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*type*/ 1 && div1_class_value !== (div1_class_value = "notification-toast " + /*type*/ ctx[0] + " svelte-17b7m0a")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToastNotification', slots, ['default']);
    	let { type } = $$props;
    	const dispatch = createEventDispatcher();

    	const handleClose = () => {
    		dispatch("close", false);
    	};

    	const writable_props = ['type'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ToastNotification> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		type,
    		dispatch,
    		handleClose
    	});

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, handleClose, $$scope, slots];
    }

    class ToastNotification extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { type: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToastNotification",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*type*/ ctx[0] === undefined && !('type' in props)) {
    			console.warn("<ToastNotification> was created without expected prop 'type'");
    		}
    	}

    	get type() {
    		throw new Error("<ToastNotification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<ToastNotification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\FilePreview.svelte generated by Svelte v3.48.0 */
    const file_1$2 = "src\\components\\FilePreview.svelte";

    // (75:4) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text(/*fileData*/ ctx[4]);
    			attr_dev(p, "class", "svelte-bbazb7");
    			add_location(p, file_1$2, 76, 8, 2178);
    			attr_dev(div, "id", "previewBoxView");
    			attr_dev(div, "class", "previewBoxView svelte-bbazb7");
    			add_location(div, file_1$2, 75, 6, 2120);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fileData*/ 16) set_data_dev(t, /*fileData*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(75:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (68:4) {#if fileData["video"]}
    function create_if_block_1$5(ctx) {
    	let video;
    	let source;
    	let source_src_value;

    	const block = {
    		c: function create() {
    			video = element("video");
    			source = element("source");
    			if (!src_url_equal(source.src, source_src_value = "" + (/*PROXY*/ ctx[3] + "getVideoStream?location=" + /*path*/ ctx[7] + "&cred=" + getCookie$2('G_VAR2')))) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file_1$2, 69, 8, 1954);
    			attr_dev(video, "id", "previewBoxView");
    			video.controls = true;
    			video.autoplay = true;
    			video.muted = false;
    			attr_dev(video, "class", "svelte-bbazb7");
    			add_location(video, file_1$2, 68, 6, 1885);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, source);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*PROXY, path*/ 136 && !src_url_equal(source.src, source_src_value = "" + (/*PROXY*/ ctx[3] + "getVideoStream?location=" + /*path*/ ctx[7] + "&cred=" + getCookie$2('G_VAR2')))) {
    				attr_dev(source, "src", source_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(68:4) {#if fileData[\\\"video\\\"]}",
    		ctx
    	});

    	return block;
    }

    // (90:4) {:else}
    function create_else_block$4(ctx) {
    	let p;
    	let t0;
    	let span;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Location: ");
    			span = element("span");
    			t1 = text("./");
    			t2 = text(/*file*/ ctx[1]);
    			attr_dev(span, "class", "svelte-bbazb7");
    			add_location(span, file_1$2, 90, 19, 2626);
    			attr_dev(p, "class", "svelte-bbazb7");
    			add_location(p, file_1$2, 90, 6, 2613);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, span);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*file*/ 2) set_data_dev(t2, /*file*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(90:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (88:4) {#if selected}
    function create_if_block$9(ctx) {
    	let p;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Location: ");
    			span = element("span");
    			t1 = text("./");
    			t2 = text(/*selected*/ ctx[0]);
    			t3 = text("/");
    			t4 = text(/*file*/ ctx[1]);
    			attr_dev(span, "class", "svelte-bbazb7");
    			add_location(span, file_1$2, 88, 19, 2556);
    			attr_dev(p, "class", "svelte-bbazb7");
    			add_location(p, file_1$2, 88, 6, 2543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, span);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			append_dev(span, t3);
    			append_dev(span, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected*/ 1) set_data_dev(t2, /*selected*/ ctx[0]);
    			if (dirty & /*file*/ 2) set_data_dev(t4, /*file*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(88:4) {#if selected}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let button0;
    	let t2;
    	let h1;
    	let t4;
    	let p0;
    	let t5;
    	let span0;
    	let t6;
    	let t7;
    	let t8;
    	let p1;
    	let t9;
    	let span1;
    	let t10_value = /*metadata*/ ctx[2].dateCreated + "";
    	let t10;
    	let t11;
    	let t12;
    	let div1;
    	let button1;
    	let t14;
    	let button2;
    	let t16;
    	let button3;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*fileData*/ ctx[4]["video"]) return create_if_block_1$5;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*selected*/ ctx[0]) return create_if_block$9;
    		return create_else_block$4;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "✖";
    			t2 = space();
    			h1 = element("h1");
    			h1.textContent = "About File";
    			t4 = space();
    			p0 = element("p");
    			t5 = text("Size: ");
    			span0 = element("span");
    			t6 = text(/*fileSize*/ ctx[6]);
    			t7 = text(/*fileSizeUnit*/ ctx[5]);
    			t8 = space();
    			p1 = element("p");
    			t9 = text("Date created: ");
    			span1 = element("span");
    			t10 = text(t10_value);
    			t11 = space();
    			if_block1.c();
    			t12 = space();
    			div1 = element("div");
    			button1 = element("button");
    			button1.textContent = "Download";
    			t14 = space();
    			button2 = element("button");
    			button2.textContent = "Share";
    			t16 = space();
    			button3 = element("button");
    			button3.textContent = "Delete";
    			attr_dev(div0, "class", "previewBox svelte-bbazb7");
    			add_location(div0, file_1$2, 66, 2, 1797);
    			attr_dev(button0, "class", "close-button svelte-bbazb7");
    			add_location(button0, file_1$2, 81, 4, 2265);
    			attr_dev(h1, "class", "svelte-bbazb7");
    			add_location(h1, file_1$2, 84, 4, 2378);
    			attr_dev(span0, "class", "svelte-bbazb7");
    			add_location(span0, file_1$2, 85, 13, 2412);
    			attr_dev(p0, "class", "svelte-bbazb7");
    			add_location(p0, file_1$2, 85, 4, 2403);
    			attr_dev(span1, "class", "svelte-bbazb7");
    			add_location(span1, file_1$2, 86, 21, 2476);
    			attr_dev(p1, "class", "svelte-bbazb7");
    			add_location(p1, file_1$2, 86, 4, 2459);
    			attr_dev(button1, "class", "downloadButton svelte-bbazb7");
    			add_location(button1, file_1$2, 93, 6, 2703);
    			attr_dev(button2, "class", "shareButton svelte-bbazb7");
    			add_location(button2, file_1$2, 100, 6, 2900);
    			attr_dev(button3, "class", "deleteButton svelte-bbazb7");
    			add_location(button3, file_1$2, 107, 6, 3088);
    			attr_dev(div1, "class", "actionButtons svelte-bbazb7");
    			add_location(div1, file_1$2, 92, 4, 2668);
    			attr_dev(div2, "class", "previewMeta svelte-bbazb7");
    			add_location(div2, file_1$2, 80, 2, 2234);
    			attr_dev(div3, "class", "preview svelte-bbazb7");
    			add_location(div3, file_1$2, 65, 0, 1772);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			if_block0.m(div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t2);
    			append_dev(div2, h1);
    			append_dev(div2, t4);
    			append_dev(div2, p0);
    			append_dev(p0, t5);
    			append_dev(p0, span0);
    			append_dev(span0, t6);
    			append_dev(span0, t7);
    			append_dev(div2, t8);
    			append_dev(div2, p1);
    			append_dev(p1, t9);
    			append_dev(p1, span1);
    			append_dev(span1, t10);
    			append_dev(div2, t11);
    			if_block1.m(div2, null);
    			append_dev(div2, t12);
    			append_dev(div2, div1);
    			append_dev(div1, button1);
    			append_dev(div1, t14);
    			append_dev(div1, button2);
    			append_dev(div1, t16);
    			append_dev(div1, button3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*closePreviewBox*/ ctx[9], false, false, false),
    					listen_dev(button0, "click", /*click_handler*/ ctx[10], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[11], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[12], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (dirty & /*fileSize*/ 64) set_data_dev(t6, /*fileSize*/ ctx[6]);
    			if (dirty & /*fileSizeUnit*/ 32) set_data_dev(t7, /*fileSizeUnit*/ ctx[5]);
    			if (dirty & /*metadata*/ 4 && t10_value !== (t10_value = /*metadata*/ ctx[2].dateCreated + "")) set_data_dev(t10, t10_value);

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div2, t12);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block0.d();
    			if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getCookie$2(name) {
    	const value = `; ${document.cookie}`;
    	const parts = value.split(`; ${name}=`);
    	if (parts.length === 2) return parts.pop().split(";").shift();
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FilePreview', slots, []);
    	const dispatch = createEventDispatcher();
    	let { selected } = $$props;
    	let { file } = $$props;
    	let { metadata } = $$props;
    	let { PROXY } = $$props;
    	let fileData = "N/A";
    	let fileSizeUnit = "b";
    	let fileSize = metadata.size;

    	if (metadata.size > 1000000000) {
    		fileSizeUnit = "Gb";
    		fileSize = Math.round(metadata.size / 1000000000);
    	} else if (metadata.size > 1000000) {
    		fileSizeUnit = "Mb";
    		fileSize = Math.round(metadata.size / 1000000);
    	} else if (metadata.size > 1000) {
    		fileSizeUnit = "Kb";
    		fileSize = Math.round(metadata.size / 1000);
    	}

    	let path;

    	if (selected) {
    		path = `./${selected}/${file}`;
    	} else {
    		path = `./${file}`;
    	}

    	fetch(`${PROXY}getFileData?location=${path}&cred=${getCookie$2("G_VAR2")}`).then(response => response.json()).then(data => {
    		if (data["video"]) {
    			$$invalidate(4, fileData = { video: true });
    		} else {
    			$$invalidate(4, fileData = data.fileData);
    		}
    	});

    	const closePreviewBox = e => {
    		const innerBox = document.querySelector("#previewBoxView");

    		const x = e.pageX,
    			y = e.pageY,
    			boxX = innerBox.getBoundingClientRect().left,
    			boxY = innerBox.getBoundingClientRect().top,
    			boxWidth = innerBox.offsetWidth,
    			boxHeight = innerBox.offsetHeight;

    		if (!(x >= boxX & x <= boxX + boxWidth & y >= boxY & y <= boxY + boxHeight)) {
    			dispatch("hidePreview", true);
    		}
    	};

    	const writable_props = ['selected', 'file', 'metadata', 'PROXY'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FilePreview> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("hidePreview", true);

    	const click_handler_1 = () => {
    		dispatch("downloadFile", true);
    		dispatch("hidePreview", true);
    	};

    	const click_handler_2 = () => {
    		dispatch("shareFile", true);
    		dispatch("hidePreview", true);
    	};

    	const click_handler_3 = () => {
    		dispatch("deleteFile", true);
    		dispatch("hidePreview", true);
    	};

    	$$self.$$set = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('file' in $$props) $$invalidate(1, file = $$props.file);
    		if ('metadata' in $$props) $$invalidate(2, metadata = $$props.metadata);
    		if ('PROXY' in $$props) $$invalidate(3, PROXY = $$props.PROXY);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		selected,
    		file,
    		metadata,
    		PROXY,
    		fileData,
    		fileSizeUnit,
    		fileSize,
    		path,
    		getCookie: getCookie$2,
    		closePreviewBox
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('file' in $$props) $$invalidate(1, file = $$props.file);
    		if ('metadata' in $$props) $$invalidate(2, metadata = $$props.metadata);
    		if ('PROXY' in $$props) $$invalidate(3, PROXY = $$props.PROXY);
    		if ('fileData' in $$props) $$invalidate(4, fileData = $$props.fileData);
    		if ('fileSizeUnit' in $$props) $$invalidate(5, fileSizeUnit = $$props.fileSizeUnit);
    		if ('fileSize' in $$props) $$invalidate(6, fileSize = $$props.fileSize);
    		if ('path' in $$props) $$invalidate(7, path = $$props.path);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selected,
    		file,
    		metadata,
    		PROXY,
    		fileData,
    		fileSizeUnit,
    		fileSize,
    		path,
    		dispatch,
    		closePreviewBox,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class FilePreview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			selected: 0,
    			file: 1,
    			metadata: 2,
    			PROXY: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FilePreview",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selected*/ ctx[0] === undefined && !('selected' in props)) {
    			console.warn("<FilePreview> was created without expected prop 'selected'");
    		}

    		if (/*file*/ ctx[1] === undefined && !('file' in props)) {
    			console.warn("<FilePreview> was created without expected prop 'file'");
    		}

    		if (/*metadata*/ ctx[2] === undefined && !('metadata' in props)) {
    			console.warn("<FilePreview> was created without expected prop 'metadata'");
    		}

    		if (/*PROXY*/ ctx[3] === undefined && !('PROXY' in props)) {
    			console.warn("<FilePreview> was created without expected prop 'PROXY'");
    		}
    	}

    	get selected() {
    		throw new Error("<FilePreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<FilePreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get file() {
    		throw new Error("<FilePreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set file(value) {
    		throw new Error("<FilePreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get metadata() {
    		throw new Error("<FilePreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set metadata(value) {
    		throw new Error("<FilePreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get PROXY() {
    		throw new Error("<FilePreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set PROXY(value) {
    		throw new Error("<FilePreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\FileShare.svelte generated by Svelte v3.48.0 */

    const { Object: Object_1$2 } = globals;
    const file_1$1 = "src\\components\\FileShare.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (104:4) {#each Object.keys(friends) as friend (friend)}
    function create_each_block$4(key_1, ctx) {
    	let button;
    	let p0;
    	let t0_value = /*friends*/ ctx[2][/*friend*/ ctx[8]].fName + "";
    	let t0;
    	let t1;
    	let t2_value = /*friends*/ ctx[2][/*friend*/ ctx[8]].lName + "";
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5_value = /*friends*/ ctx[2][/*friend*/ ctx[8]].uName + "";
    	let t5;
    	let t6;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[6](/*friend*/ ctx[8]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			button = element("button");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			p1 = element("p");
    			t4 = text("@");
    			t5 = text(t5_value);
    			t6 = space();
    			attr_dev(p0, "class", "svelte-l6qyse");
    			add_location(p0, file_1$1, 111, 8, 2625);
    			attr_dev(p1, "class", "bold svelte-l6qyse");
    			add_location(p1, file_1$1, 112, 8, 2689);
    			attr_dev(button, "class", "friend svelte-l6qyse");
    			add_location(button, file_1$1, 104, 6, 2441);
    			this.first = button;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(button, t3);
    			append_dev(button, p1);
    			append_dev(p1, t4);
    			append_dev(p1, t5);
    			append_dev(button, t6);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(104:4) {#each Object.keys(friends) as friend (friend)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let t3;
    	let div1;
    	let input;
    	let t4;
    	let button;
    	let t6;
    	let div2;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let each_value = Object.keys(/*friends*/ ctx[2]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*friend*/ ctx[8];
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text("Share ");
    			span = element("span");
    			t1 = text(/*file*/ ctx[0]);
    			t2 = text(" to");
    			t3 = space();
    			div1 = element("div");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "✖";
    			t6 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "bold svelte-l6qyse");
    			add_location(span, file_1$1, 88, 10, 2006);
    			attr_dev(div0, "class", "info svelte-l6qyse");
    			add_location(div0, file_1$1, 87, 2, 1976);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search Friends");
    			attr_dev(input, "class", "svelte-l6qyse");
    			add_location(input, file_1$1, 91, 4, 2082);
    			attr_dev(button, "class", "close-button svelte-l6qyse");
    			add_location(button, file_1$1, 98, 4, 2219);
    			attr_dev(div1, "class", "top-row svelte-l6qyse");
    			add_location(div1, file_1$1, 90, 2, 2055);
    			attr_dev(div2, "class", "friend-grid svelte-l6qyse");
    			attr_dev(div2, "id", "friend-grid");
    			add_location(div2, file_1$1, 102, 2, 2338);
    			attr_dev(div3, "class", "sharePeople svelte-l6qyse");
    			add_location(div3, file_1$1, 86, 0, 1947);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div0, span);
    			append_dev(span, t1);
    			append_dev(div0, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, input);
    			append_dev(div1, t4);
    			append_dev(div1, button);
    			append_dev(div3, t6);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[4], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*file*/ 1) set_data_dev(t1, /*file*/ ctx[0]);

    			if (dirty & /*dispatch, friends, Object*/ 6) {
    				each_value = Object.keys(/*friends*/ ctx[2]);
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div2, destroy_block, create_each_block$4, null, get_each_context$4);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FileShare', slots, []);
    	const dispatch = createEventDispatcher();
    	let { file } = $$props;
    	let filterWords = "";

    	let friends = {
    		1: {
    			fName: "Larry",
    			lName: "Bobbins",
    			uName: "lbobbins123"
    		},
    		2: {
    			fName: "Jeff",
    			lName: "Robinson",
    			uName: "robinj2"
    		},
    		3: {
    			fName: "Howard",
    			lName: "Ward",
    			uName: "hward101"
    		},
    		4: {
    			fName: "Gary",
    			lName: "Anderson",
    			uName: "attackhelicopter"
    		},
    		5: {
    			fName: "Susan",
    			lName: "Wojisk",
    			uName: "tubeyou"
    		},
    		6: {
    			fName: "Larry",
    			lName: "Bobbins",
    			uName: "lbobbins123"
    		},
    		7: {
    			fName: "Jeff",
    			lName: "Robinson",
    			uName: "robinj2"
    		},
    		8: {
    			fName: "Howard",
    			lName: "Ward",
    			uName: "hward101"
    		},
    		9: {
    			fName: "Gary",
    			lName: "Anderson",
    			uName: "attackhelicopter"
    		},
    		10: {
    			fName: "Susan",
    			lName: "Wojisk",
    			uName: "tubeyou"
    		},
    		11: {
    			fName: "Jeff",
    			lName: "Jeffins",
    			uName: "efwiojio"
    		}
    	};

    	const filterSearch = e => {
    		filterWords = e.target.value;
    		var filter, ul, li, a, i, txtValue;
    		filter = filterWords.toUpperCase();
    		ul = document.getElementById("friend-grid");
    		li = ul.getElementsByTagName("button");

    		for (i = 0; i < li.length; i++) {
    			a = li[i].getElementsByTagName("p")[0];
    			let a2 = li[i].getElementsByTagName("p")[1];
    			let txtValue2 = a2.textContent || a2.innerText;
    			txtValue = a.textContent || a.innerText;

    			if (txtValue.toUpperCase().indexOf(filter) > -1 || txtValue2.toUpperCase().indexOf(filter) > -1) {
    				li[i].style.display = "";
    			} else {
    				li[i].style.display = "none";
    			}
    		}
    	};

    	const writable_props = ['file'];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FileShare> was created with unknown prop '${key}'`);
    	});

    	const keyup_handler = e => {
    		filterSearch(e);
    	};

    	const click_handler = () => dispatch("hideShare", true);

    	const click_handler_1 = friend => {
    		dispatch("hideShare", true);
    		dispatch("shareTo", friends[friend].uName);
    	};

    	$$self.$$set = $$props => {
    		if ('file' in $$props) $$invalidate(0, file = $$props.file);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		file,
    		filterWords,
    		friends,
    		filterSearch
    	});

    	$$self.$inject_state = $$props => {
    		if ('file' in $$props) $$invalidate(0, file = $$props.file);
    		if ('filterWords' in $$props) filterWords = $$props.filterWords;
    		if ('friends' in $$props) $$invalidate(2, friends = $$props.friends);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		file,
    		dispatch,
    		friends,
    		filterSearch,
    		keyup_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class FileShare extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { file: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileShare",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*file*/ ctx[0] === undefined && !('file' in props)) {
    			console.warn("<FileShare> was created without expected prop 'file'");
    		}
    	}

    	get file() {
    		throw new Error("<FileShare>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set file(value) {
    		throw new Error("<FileShare>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\BoolPrompt.svelte generated by Svelte v3.48.0 */
    const file$d = "src\\components\\BoolPrompt.svelte";

    function create_fragment$h(ctx) {
    	let div1;
    	let p;
    	let t0;
    	let div0;
    	let button0;
    	let t2;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p = element("p");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Yes";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "No";
    			attr_dev(p, "class", "svelte-3f2dei");
    			add_location(p, file$d, 7, 2, 168);
    			attr_dev(button0, "class", "yes svelte-3f2dei");
    			add_location(button0, file$d, 9, 4, 214);
    			attr_dev(button1, "class", "no svelte-3f2dei");
    			add_location(button1, file$d, 15, 4, 358);
    			attr_dev(div0, "class", "buttons svelte-3f2dei");
    			add_location(div0, file$d, 8, 2, 187);
    			attr_dev(div1, "class", "boolPrompt svelte-3f2dei");
    			add_location(div1, file$d, 6, 0, 140);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);

    			if (default_slot) {
    				default_slot.m(p, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t2);
    			append_dev(div0, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BoolPrompt', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { extra } = $$props;
    	const writable_props = ['extra'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BoolPrompt> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		dispatch("boolChoose", { choose: true, extra });
    	};

    	const click_handler_1 = () => {
    		dispatch("boolChoose", { choose: false, extra });
    	};

    	$$self.$$set = $$props => {
    		if ('extra' in $$props) $$invalidate(0, extra = $$props.extra);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ createEventDispatcher, dispatch, extra });

    	$$self.$inject_state = $$props => {
    		if ('extra' in $$props) $$invalidate(0, extra = $$props.extra);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [extra, dispatch, $$scope, slots, click_handler, click_handler_1];
    }

    class BoolPrompt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { extra: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BoolPrompt",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*extra*/ ctx[0] === undefined && !('extra' in props)) {
    			console.warn("<BoolPrompt> was created without expected prop 'extra'");
    		}
    	}

    	get extra() {
    		throw new Error("<BoolPrompt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extra(value) {
    		throw new Error("<BoolPrompt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\File.svelte generated by Svelte v3.48.0 */

    const { console: console_1$2 } = globals;
    const file_1 = "src\\components\\File.svelte";

    // (28:0) {#if deleteFileCheck}
    function create_if_block_3$1(ctx) {
    	let boolprompt;
    	let current;

    	boolprompt = new BoolPrompt({
    			props: {
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	boolprompt.$on("boolChoose", /*boolChoose_handler*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(boolprompt.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(boolprompt, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const boolprompt_changes = {};

    			if (dirty & /*$$scope, file*/ 262146) {
    				boolprompt_changes.$$scope = { dirty, ctx };
    			}

    			boolprompt.$set(boolprompt_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(boolprompt.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(boolprompt.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(boolprompt, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(28:0) {#if deleteFileCheck}",
    		ctx
    	});

    	return block;
    }

    // (29:2) <BoolPrompt      on:boolChoose={(e) => {        deleteFileCheck = false;        console.log(e.detail);      }}>
    function create_default_slot_1$4(ctx) {
    	let t0;
    	let span;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text("Delete ");
    			span = element("span");
    			t1 = text(/*file*/ ctx[1]);
    			t2 = text("?");
    			attr_dev(span, "class", "bold svelte-hgci6t");
    			add_location(span, file_1, 32, 14, 784);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*file*/ 2) set_data_dev(t1, /*file*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(29:2) <BoolPrompt      on:boolChoose={(e) => {        deleteFileCheck = false;        console.log(e.detail);      }}>",
    		ctx
    	});

    	return block;
    }

    // (36:0) {#if showFileShare}
    function create_if_block_2$1(ctx) {
    	let fileshare;
    	let current;

    	fileshare = new FileShare({
    			props: { file: /*file*/ ctx[1] },
    			$$inline: true
    		});

    	fileshare.$on("shareTo", /*shareTo_handler*/ ctx[13]);
    	fileshare.$on("hideShare", /*hideShare_handler*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(fileshare.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fileshare, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const fileshare_changes = {};
    			if (dirty & /*file*/ 2) fileshare_changes.file = /*file*/ ctx[1];
    			fileshare.$set(fileshare_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fileshare.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fileshare.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fileshare, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(36:0) {#if showFileShare}",
    		ctx
    	});

    	return block;
    }

    // (47:0) {#if notification !== null}
    function create_if_block_1$4(ctx) {
    	let toastnotification;
    	let current;

    	toastnotification = new ToastNotification({
    			props: {
    				type: /*notification*/ ctx[4].status,
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toastnotification.$on("close", /*close_handler*/ ctx[15]);

    	const block = {
    		c: function create() {
    			create_component(toastnotification.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toastnotification, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toastnotification_changes = {};
    			if (dirty & /*notification*/ 16) toastnotification_changes.type = /*notification*/ ctx[4].status;

    			if (dirty & /*$$scope, notification*/ 262160) {
    				toastnotification_changes.$$scope = { dirty, ctx };
    			}

    			toastnotification.$set(toastnotification_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toastnotification.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toastnotification.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toastnotification, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(47:0) {#if notification !== null}",
    		ctx
    	});

    	return block;
    }

    // (48:2) <ToastNotification      type={notification.status}      on:close={() => {        notification = null;      }}>
    function create_default_slot$7(ctx) {
    	let t_value = /*notification*/ ctx[4].msg + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notification*/ 16 && t_value !== (t_value = /*notification*/ ctx[4].msg + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(48:2) <ToastNotification      type={notification.status}      on:close={() => {        notification = null;      }}>",
    		ctx
    	});

    	return block;
    }

    // (56:2) {#if previewShow}
    function create_if_block$8(ctx) {
    	let filepreview;
    	let current;

    	filepreview = new FilePreview({
    			props: {
    				PROXY: /*PROXY*/ ctx[3],
    				file: /*file*/ ctx[1],
    				selected: /*selected*/ ctx[0],
    				metadata: /*metadata*/ ctx[2]
    			},
    			$$inline: true
    		});

    	filepreview.$on("deleteFile", /*deleteFile*/ ctx[10]);
    	filepreview.$on("downloadFile", /*downloadFile*/ ctx[8]);
    	filepreview.$on("shareFile", /*shareFile*/ ctx[9]);
    	filepreview.$on("hidePreview", /*hidePreview_handler*/ ctx[16]);

    	const block = {
    		c: function create() {
    			create_component(filepreview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(filepreview, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const filepreview_changes = {};
    			if (dirty & /*PROXY*/ 8) filepreview_changes.PROXY = /*PROXY*/ ctx[3];
    			if (dirty & /*file*/ 2) filepreview_changes.file = /*file*/ ctx[1];
    			if (dirty & /*selected*/ 1) filepreview_changes.selected = /*selected*/ ctx[0];
    			if (dirty & /*metadata*/ 4) filepreview_changes.metadata = /*metadata*/ ctx[2];
    			filepreview.$set(filepreview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filepreview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filepreview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(filepreview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(56:2) {#if previewShow}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let li;
    	let t3;
    	let button0;
    	let t4;
    	let div;
    	let button1;
    	let img0;
    	let img0_src_value;
    	let t5;
    	let button2;
    	let img1;
    	let img1_src_value;
    	let t6;
    	let button3;
    	let img2;
    	let img2_src_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*deleteFileCheck*/ ctx[7] && create_if_block_3$1(ctx);
    	let if_block1 = /*showFileShare*/ ctx[6] && create_if_block_2$1(ctx);
    	let if_block2 = /*notification*/ ctx[4] !== null && create_if_block_1$4(ctx);
    	let if_block3 = /*previewShow*/ ctx[5] && create_if_block$8(ctx);
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			li = element("li");
    			if (if_block3) if_block3.c();
    			t3 = space();
    			button0 = element("button");
    			if (default_slot) default_slot.c();
    			t4 = space();
    			div = element("div");
    			button1 = element("button");
    			img0 = element("img");
    			t5 = space();
    			button2 = element("button");
    			img1 = element("img");
    			t6 = space();
    			button3 = element("button");
    			img2 = element("img");
    			attr_dev(button0, "class", "svelte-hgci6t");
    			add_location(button0, file_1, 67, 2, 1539);
    			if (!src_url_equal(img0.src, img0_src_value = "icons/download.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Download");
    			attr_dev(img0, "class", "svelte-hgci6t");
    			add_location(img0, file_1, 70, 7, 1671);
    			attr_dev(button1, "class", "svelte-hgci6t");
    			add_location(button1, file_1, 69, 4, 1631);
    			if (!src_url_equal(img1.src, img1_src_value = "icons/share.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Share");
    			attr_dev(img1, "class", "svelte-hgci6t");
    			add_location(img1, file_1, 73, 7, 1776);
    			attr_dev(button2, "class", "svelte-hgci6t");
    			add_location(button2, file_1, 72, 4, 1739);
    			if (!src_url_equal(img2.src, img2_src_value = "icons/trash.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Trash");
    			attr_dev(img2, "class", "svelte-hgci6t");
    			add_location(img2, file_1, 76, 7, 1876);
    			attr_dev(button3, "class", "svelte-hgci6t");
    			add_location(button3, file_1, 75, 4, 1838);
    			attr_dev(div, "class", "stuff svelte-hgci6t");
    			add_location(div, file_1, 68, 2, 1606);
    			attr_dev(li, "class", "svelte-hgci6t");
    			add_location(li, file_1, 54, 0, 1254);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, li, anchor);
    			if (if_block3) if_block3.m(li, null);
    			append_dev(li, t3);
    			append_dev(li, button0);

    			if (default_slot) {
    				default_slot.m(button0, null);
    			}

    			append_dev(li, t4);
    			append_dev(li, div);
    			append_dev(div, button1);
    			append_dev(button1, img0);
    			append_dev(div, t5);
    			append_dev(div, button2);
    			append_dev(button2, img1);
    			append_dev(div, t6);
    			append_dev(div, button3);
    			append_dev(button3, img2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[17], false, false, false),
    					listen_dev(button1, "click", /*downloadFile*/ ctx[8], false, false, false),
    					listen_dev(button2, "click", /*shareFile*/ ctx[9], false, false, false),
    					listen_dev(button3, "click", /*deleteFile*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*deleteFileCheck*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*deleteFileCheck*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*showFileShare*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showFileShare*/ 64) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*notification*/ ctx[4] !== null) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*notification*/ 16) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1$4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*previewShow*/ ctx[5]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*previewShow*/ 32) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block$8(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(li, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 262144)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(li);
    			if (if_block3) if_block3.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('File', slots, ['default']);
    	let { selected } = $$props;
    	let { file } = $$props;
    	let { metadata } = $$props;
    	let { PROXY } = $$props;
    	let notification = null;
    	let previewShow = false;
    	let showFileShare = false;
    	let deleteFileCheck = false;

    	const downloadFile = () => {
    		console.log("Download");
    	};

    	const shareFile = () => {
    		$$invalidate(6, showFileShare = true);
    	};

    	const deleteFile = () => {
    		$$invalidate(7, deleteFileCheck = true);
    	};

    	const writable_props = ['selected', 'file', 'metadata', 'PROXY'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<File> was created with unknown prop '${key}'`);
    	});

    	const boolChoose_handler = e => {
    		$$invalidate(7, deleteFileCheck = false);
    		console.log(e.detail);
    	};

    	const shareTo_handler = e => {
    		$$invalidate(4, notification = { msg: e.detail, status: "success" });
    	};

    	const hideShare_handler = () => {
    		$$invalidate(6, showFileShare = false);
    	};

    	const close_handler = () => {
    		$$invalidate(4, notification = null);
    	};

    	const hidePreview_handler = () => $$invalidate(5, previewShow = false);
    	const click_handler = () => $$invalidate(5, previewShow = true);

    	$$self.$$set = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('file' in $$props) $$invalidate(1, file = $$props.file);
    		if ('metadata' in $$props) $$invalidate(2, metadata = $$props.metadata);
    		if ('PROXY' in $$props) $$invalidate(3, PROXY = $$props.PROXY);
    		if ('$$scope' in $$props) $$invalidate(18, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		FilePreview,
    		FileShare,
    		ToastNotification,
    		BoolPrompt,
    		selected,
    		file,
    		metadata,
    		PROXY,
    		notification,
    		previewShow,
    		showFileShare,
    		deleteFileCheck,
    		downloadFile,
    		shareFile,
    		deleteFile
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('file' in $$props) $$invalidate(1, file = $$props.file);
    		if ('metadata' in $$props) $$invalidate(2, metadata = $$props.metadata);
    		if ('PROXY' in $$props) $$invalidate(3, PROXY = $$props.PROXY);
    		if ('notification' in $$props) $$invalidate(4, notification = $$props.notification);
    		if ('previewShow' in $$props) $$invalidate(5, previewShow = $$props.previewShow);
    		if ('showFileShare' in $$props) $$invalidate(6, showFileShare = $$props.showFileShare);
    		if ('deleteFileCheck' in $$props) $$invalidate(7, deleteFileCheck = $$props.deleteFileCheck);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selected,
    		file,
    		metadata,
    		PROXY,
    		notification,
    		previewShow,
    		showFileShare,
    		deleteFileCheck,
    		downloadFile,
    		shareFile,
    		deleteFile,
    		slots,
    		boolChoose_handler,
    		shareTo_handler,
    		hideShare_handler,
    		close_handler,
    		hidePreview_handler,
    		click_handler,
    		$$scope
    	];
    }

    class File$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			selected: 0,
    			file: 1,
    			metadata: 2,
    			PROXY: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "File",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selected*/ ctx[0] === undefined && !('selected' in props)) {
    			console_1$2.warn("<File> was created without expected prop 'selected'");
    		}

    		if (/*file*/ ctx[1] === undefined && !('file' in props)) {
    			console_1$2.warn("<File> was created without expected prop 'file'");
    		}

    		if (/*metadata*/ ctx[2] === undefined && !('metadata' in props)) {
    			console_1$2.warn("<File> was created without expected prop 'metadata'");
    		}

    		if (/*PROXY*/ ctx[3] === undefined && !('PROXY' in props)) {
    			console_1$2.warn("<File> was created without expected prop 'PROXY'");
    		}
    	}

    	get selected() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get file() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set file(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get metadata() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set metadata(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get PROXY() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set PROXY(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\FileStruct.svelte generated by Svelte v3.48.0 */
    const file$c = "src\\components\\FileStruct.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (10:4) <File {selected} {PROXY} file={file.name} metadata={file.metadata}>
    function create_default_slot$6(ctx) {
    	let t0_value = /*file*/ ctx[3].name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*files*/ 1 && t0_value !== (t0_value = /*file*/ ctx[3].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(10:4) <File {selected} {PROXY} file={file.name} metadata={file.metadata}>",
    		ctx
    	});

    	return block;
    }

    // (9:2) {#each files as file}
    function create_each_block$3(ctx) {
    	let file_1;
    	let current;

    	file_1 = new File$1({
    			props: {
    				selected: /*selected*/ ctx[1],
    				PROXY: /*PROXY*/ ctx[2],
    				file: /*file*/ ctx[3].name,
    				metadata: /*file*/ ctx[3].metadata,
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(file_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(file_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const file_1_changes = {};
    			if (dirty & /*selected*/ 2) file_1_changes.selected = /*selected*/ ctx[1];
    			if (dirty & /*PROXY*/ 4) file_1_changes.PROXY = /*PROXY*/ ctx[2];
    			if (dirty & /*files*/ 1) file_1_changes.file = /*file*/ ctx[3].name;
    			if (dirty & /*files*/ 1) file_1_changes.metadata = /*file*/ ctx[3].metadata;

    			if (dirty & /*$$scope, files*/ 65) {
    				file_1_changes.$$scope = { dirty, ctx };
    			}

    			file_1.$set(file_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(file_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(file_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(file_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(9:2) {#each files as file}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let ul;
    	let current;
    	let each_value = /*files*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-y84i2d");
    			add_location(ul, file$c, 7, 0, 126);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selected, PROXY, files*/ 7) {
    				each_value = /*files*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FileStruct', slots, []);
    	let { files } = $$props;
    	let { selected } = $$props;
    	let { PROXY } = $$props;
    	const writable_props = ['files', 'selected', 'PROXY'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FileStruct> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('files' in $$props) $$invalidate(0, files = $$props.files);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('PROXY' in $$props) $$invalidate(2, PROXY = $$props.PROXY);
    	};

    	$$self.$capture_state = () => ({ File: File$1, files, selected, PROXY });

    	$$self.$inject_state = $$props => {
    		if ('files' in $$props) $$invalidate(0, files = $$props.files);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('PROXY' in $$props) $$invalidate(2, PROXY = $$props.PROXY);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [files, selected, PROXY];
    }

    class FileStruct extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { files: 0, selected: 1, PROXY: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileStruct",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*files*/ ctx[0] === undefined && !('files' in props)) {
    			console.warn("<FileStruct> was created without expected prop 'files'");
    		}

    		if (/*selected*/ ctx[1] === undefined && !('selected' in props)) {
    			console.warn("<FileStruct> was created without expected prop 'selected'");
    		}

    		if (/*PROXY*/ ctx[2] === undefined && !('PROXY' in props)) {
    			console.warn("<FileStruct> was created without expected prop 'PROXY'");
    		}
    	}

    	get files() {
    		throw new Error("<FileStruct>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set files(value) {
    		throw new Error("<FileStruct>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<FileStruct>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<FileStruct>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get PROXY() {
    		throw new Error("<FileStruct>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set PROXY(value) {
    		throw new Error("<FileStruct>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\SideFolder.svelte generated by Svelte v3.48.0 */
    const file$b = "src\\components\\SideFolder.svelte";

    // (20:2) <Link to="about">
    function create_default_slot_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("About page");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(20:2) <Link to=\\\"about\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:2) <Link to="logout">
    function create_default_slot$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Logout");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(21:2) <Link to=\\\"logout\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let button;
    	let img;
    	let img_src_value;
    	let t0;
    	let section;
    	let link0;
    	let t1;
    	let link1;
    	let current;
    	let mounted;
    	let dispose;

    	link0 = new Link$1({
    			props: {
    				to: "about",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link$1({
    			props: {
    				to: "logout",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			t0 = space();
    			section = element("section");
    			create_component(link0.$$.fragment);
    			t1 = space();
    			create_component(link1.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = "/icons/grid.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Menu");
    			attr_dev(img, "class", "svelte-bb91kj");
    			add_location(img, file$b, 15, 5, 509);
    			attr_dev(button, "class", "slide-folder-button svelte-bb91kj");
    			attr_dev(button, "id", "slide-button");
    			add_location(button, file$b, 4, 0, 67);
    			attr_dev(section, "class", "sideFolder svelte-bb91kj");
    			attr_dev(section, "id", "sideFolder");
    			add_location(section, file$b, 18, 0, 564);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			mount_component(link0, section, null);
    			append_dev(section, t1);
    			mount_component(link1, section, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    			destroy_component(link0);
    			destroy_component(link1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SideFolder', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SideFolder> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		if (document.getElementById("slide-button").style.left === "85px") {
    			document.getElementById("slide-button").style.left = "5px";
    			document.getElementById("sideFolder").style.left = "-80px";
    			return;
    		}

    		document.getElementById("slide-button").style.left = "85px";
    		document.getElementById("sideFolder").style.left = 0;
    	};

    	$$self.$capture_state = () => ({ Link: Link$1 });
    	return [click_handler];
    }

    class SideFolder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideFolder",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\components\FolderButton.svelte generated by Svelte v3.48.0 */
    const file$a = "src\\components\\FolderButton.svelte";

    // (14:0) {#if exclude !== location}
    function create_if_block$7(ctx) {
    	let li;
    	let button0;
    	let img0;
    	let img0_src_value;
    	let t;
    	let button1;
    	let img1;
    	let img1_src_value;
    	let p;
    	let button1_class_value;
    	let li_id_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			li = element("li");
    			button0 = element("button");
    			img0 = element("img");
    			t = space();
    			button1 = element("button");
    			img1 = element("img");
    			p = element("p");
    			if (default_slot) default_slot.c();
    			if (!src_url_equal(img0.src, img0_src_value = "icons/triangle.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-1i2b9wc");
    			add_location(img0, file$a, 16, 6, 398);
    			attr_dev(button0, "class", "tributton svelte-1i2b9wc");
    			add_location(button0, file$a, 15, 4, 364);
    			if (!src_url_equal(img1.src, img1_src_value = "folder.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Folder Img");
    			attr_dev(img1, "class", "svelte-1i2b9wc");
    			add_location(img1, file$a, 22, 6, 588);
    			attr_dev(p, "class", "svelte-1i2b9wc");
    			add_location(p, file$a, 22, 47, 629);

    			attr_dev(button1, "class", button1_class_value = "selectButton " + (/*selected*/ ctx[2] === /*location*/ ctx[0]
    			? 'buttonSelected'
    			: null) + " svelte-1i2b9wc");

    			add_location(button1, file$a, 18, 4, 458);
    			attr_dev(li, "id", li_id_value = /*location*/ ctx[0] + /*folderName*/ ctx[1]);
    			attr_dev(li, "class", "svelte-1i2b9wc");
    			add_location(li, file$a, 14, 2, 327);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button0);
    			append_dev(button0, img0);
    			append_dev(li, t);
    			append_dev(li, button1);
    			append_dev(button1, img1);
    			append_dev(button1, p);

    			if (default_slot) {
    				default_slot.m(p, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button1, "click", /*clickFolder*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*selected, location*/ 5 && button1_class_value !== (button1_class_value = "selectButton " + (/*selected*/ ctx[2] === /*location*/ ctx[0]
    			? 'buttonSelected'
    			: null) + " svelte-1i2b9wc")) {
    				attr_dev(button1, "class", button1_class_value);
    			}

    			if (!current || dirty & /*location, folderName*/ 3 && li_id_value !== (li_id_value = /*location*/ ctx[0] + /*folderName*/ ctx[1])) {
    				attr_dev(li, "id", li_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(14:0) {#if exclude !== location}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*exclude*/ ctx[3] !== /*location*/ ctx[0] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*exclude*/ ctx[3] !== /*location*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*exclude, location*/ 9) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FolderButton', slots, ['default']);
    	let { location } = $$props;
    	let { folderName } = $$props;
    	let { selected } = $$props;
    	let { exclude } = $$props;
    	const dispatch = createEventDispatcher();

    	const clickFolder = () => {
    		dispatch("folderClicked", location);
    	};

    	const writable_props = ['location', 'folderName', 'selected', 'exclude'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FolderButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('location' in $$props) $$invalidate(0, location = $$props.location);
    		if ('folderName' in $$props) $$invalidate(1, folderName = $$props.folderName);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('exclude' in $$props) $$invalidate(3, exclude = $$props.exclude);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		location,
    		folderName,
    		selected,
    		exclude,
    		dispatch,
    		clickFolder
    	});

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate(0, location = $$props.location);
    		if ('folderName' in $$props) $$invalidate(1, folderName = $$props.folderName);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('exclude' in $$props) $$invalidate(3, exclude = $$props.exclude);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [location, folderName, selected, exclude, clickFolder, $$scope, slots];
    }

    class FolderButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			location: 0,
    			folderName: 1,
    			selected: 2,
    			exclude: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FolderButton",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*location*/ ctx[0] === undefined && !('location' in props)) {
    			console.warn("<FolderButton> was created without expected prop 'location'");
    		}

    		if (/*folderName*/ ctx[1] === undefined && !('folderName' in props)) {
    			console.warn("<FolderButton> was created without expected prop 'folderName'");
    		}

    		if (/*selected*/ ctx[2] === undefined && !('selected' in props)) {
    			console.warn("<FolderButton> was created without expected prop 'selected'");
    		}

    		if (/*exclude*/ ctx[3] === undefined && !('exclude' in props)) {
    			console.warn("<FolderButton> was created without expected prop 'exclude'");
    		}
    	}

    	get location() {
    		throw new Error("<FolderButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<FolderButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get folderName() {
    		throw new Error("<FolderButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set folderName(value) {
    		throw new Error("<FolderButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<FolderButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<FolderButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exclude() {
    		throw new Error("<FolderButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exclude(value) {
    		throw new Error("<FolderButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\FolderWSButton.svelte generated by Svelte v3.48.0 */
    const file$9 = "src\\components\\FolderWSButton.svelte";
    const get_subfolders_slot_changes = dirty => ({});
    const get_subfolders_slot_context = ctx => ({ class: "subfolderspan" });
    const get_folderName_slot_changes = dirty => ({});
    const get_folderName_slot_context = ctx => ({});

    // (15:0) {#if exclude !== location}
    function create_if_block$6(ctx) {
    	let li;
    	let button0;
    	let img0;
    	let img0_src_value;
    	let button0_class_value;
    	let t0;
    	let button1;
    	let img1;
    	let img1_src_value;
    	let p;
    	let button1_class_value;
    	let li_id_value;
    	let t1;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const folderName_slot_template = /*#slots*/ ctx[7].folderName;
    	const folderName_slot = create_slot(folderName_slot_template, ctx, /*$$scope*/ ctx[6], get_folderName_slot_context);
    	let if_block = /*showSub*/ ctx[4] && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			button0 = element("button");
    			img0 = element("img");
    			t0 = space();
    			button1 = element("button");
    			img1 = element("img");
    			p = element("p");
    			if (folderName_slot) folderName_slot.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    			if (!src_url_equal(img0.src, img0_src_value = "icons/triangle.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-qzm1jo");
    			add_location(img0, file$9, 22, 6, 533);
    			attr_dev(button0, "class", button0_class_value = "tributton " + (/*showSub*/ ctx[4] ? 'rotateButton' : null) + " svelte-qzm1jo");
    			add_location(button0, file$9, 16, 5, 388);
    			if (!src_url_equal(img1.src, img1_src_value = "folder.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Folder Img");
    			attr_dev(img1, "class", "svelte-qzm1jo");
    			add_location(img1, file$9, 28, 6, 723);
    			attr_dev(p, "class", "svelte-qzm1jo");
    			add_location(p, file$9, 28, 47, 764);

    			attr_dev(button1, "class", button1_class_value = "selectButton " + (/*selected*/ ctx[2] === /*location*/ ctx[0]
    			? 'buttonSelected'
    			: null) + " svelte-qzm1jo");

    			add_location(button1, file$9, 24, 4, 593);
    			attr_dev(li, "id", li_id_value = /*location*/ ctx[0] + /*folderName*/ ctx[1]);
    			attr_dev(li, "class", "svelte-qzm1jo");
    			add_location(li, file$9, 15, 2, 351);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button0);
    			append_dev(button0, img0);
    			append_dev(li, t0);
    			append_dev(li, button1);
    			append_dev(button1, img1);
    			append_dev(button1, p);

    			if (folderName_slot) {
    				folderName_slot.m(p, null);
    			}

    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(button1, "click", /*clickFolder*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*showSub*/ 16 && button0_class_value !== (button0_class_value = "tributton " + (/*showSub*/ ctx[4] ? 'rotateButton' : null) + " svelte-qzm1jo")) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (folderName_slot) {
    				if (folderName_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						folderName_slot,
    						folderName_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(folderName_slot_template, /*$$scope*/ ctx[6], dirty, get_folderName_slot_changes),
    						get_folderName_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*selected, location*/ 5 && button1_class_value !== (button1_class_value = "selectButton " + (/*selected*/ ctx[2] === /*location*/ ctx[0]
    			? 'buttonSelected'
    			: null) + " svelte-qzm1jo")) {
    				attr_dev(button1, "class", button1_class_value);
    			}

    			if (!current || dirty & /*location, folderName*/ 3 && li_id_value !== (li_id_value = /*location*/ ctx[0] + /*folderName*/ ctx[1])) {
    				attr_dev(li, "id", li_id_value);
    			}

    			if (/*showSub*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showSub*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(folderName_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(folderName_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (folderName_slot) folderName_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(15:0) {#if exclude !== location}",
    		ctx
    	});

    	return block;
    }

    // (32:2) {#if showSub}
    function create_if_block_1$3(ctx) {
    	let ul;
    	let current;
    	const subfolders_slot_template = /*#slots*/ ctx[7].subfolders;
    	const subfolders_slot = create_slot(subfolders_slot_template, ctx, /*$$scope*/ ctx[6], get_subfolders_slot_context);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (subfolders_slot) subfolders_slot.c();
    			attr_dev(ul, "class", "subfolder svelte-qzm1jo");
    			add_location(ul, file$9, 32, 4, 844);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			if (subfolders_slot) {
    				subfolders_slot.m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (subfolders_slot) {
    				if (subfolders_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						subfolders_slot,
    						subfolders_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(subfolders_slot_template, /*$$scope*/ ctx[6], dirty, get_subfolders_slot_changes),
    						get_subfolders_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subfolders_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subfolders_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (subfolders_slot) subfolders_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(32:2) {#if showSub}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*exclude*/ ctx[3] !== /*location*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*exclude*/ ctx[3] !== /*location*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*exclude, location*/ 9) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FolderWSButton', slots, ['folderName','subfolders']);
    	let { location } = $$props;
    	let { folderName } = $$props;
    	let { selected } = $$props;
    	let { exclude } = $$props;
    	let showSub = false;
    	const dispatch = createEventDispatcher();

    	const clickFolder = () => {
    		dispatch("folderClicked", location);
    	};

    	const writable_props = ['location', 'folderName', 'selected', 'exclude'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FolderWSButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(4, showSub = !showSub);
    	};

    	$$self.$$set = $$props => {
    		if ('location' in $$props) $$invalidate(0, location = $$props.location);
    		if ('folderName' in $$props) $$invalidate(1, folderName = $$props.folderName);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('exclude' in $$props) $$invalidate(3, exclude = $$props.exclude);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		location,
    		folderName,
    		selected,
    		exclude,
    		showSub,
    		dispatch,
    		clickFolder
    	});

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate(0, location = $$props.location);
    		if ('folderName' in $$props) $$invalidate(1, folderName = $$props.folderName);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('exclude' in $$props) $$invalidate(3, exclude = $$props.exclude);
    		if ('showSub' in $$props) $$invalidate(4, showSub = $$props.showSub);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		location,
    		folderName,
    		selected,
    		exclude,
    		showSub,
    		clickFolder,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class FolderWSButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			location: 0,
    			folderName: 1,
    			selected: 2,
    			exclude: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FolderWSButton",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*location*/ ctx[0] === undefined && !('location' in props)) {
    			console.warn("<FolderWSButton> was created without expected prop 'location'");
    		}

    		if (/*folderName*/ ctx[1] === undefined && !('folderName' in props)) {
    			console.warn("<FolderWSButton> was created without expected prop 'folderName'");
    		}

    		if (/*selected*/ ctx[2] === undefined && !('selected' in props)) {
    			console.warn("<FolderWSButton> was created without expected prop 'selected'");
    		}

    		if (/*exclude*/ ctx[3] === undefined && !('exclude' in props)) {
    			console.warn("<FolderWSButton> was created without expected prop 'exclude'");
    		}
    	}

    	get location() {
    		throw new Error("<FolderWSButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<FolderWSButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get folderName() {
    		throw new Error("<FolderWSButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set folderName(value) {
    		throw new Error("<FolderWSButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<FolderWSButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<FolderWSButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exclude() {
    		throw new Error("<FolderWSButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exclude(value) {
    		throw new Error("<FolderWSButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\FolderFilter.svelte generated by Svelte v3.48.0 */

    const { Object: Object_1$1 } = globals;
    const file$8 = "src\\components\\FolderFilter.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (13:2) {#if startFolder !== "G_files"}
    function create_if_block$5(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*currentFolder*/ 1) show_if = null;
    		if (show_if == null) show_if = !!(Object.keys(/*currentFolder*/ ctx[0][/*startFolder*/ ctx[8]]).length === 0 | (Object.keys(/*currentFolder*/ ctx[0][/*startFolder*/ ctx[8]]).length === 1 && Object.keys(/*currentFolder*/ ctx[0][/*startFolder*/ ctx[8]])[0] === "G_files"));
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(13:2) {#if startFolder !== \\\"G_files\\\"}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {:else}
    function create_else_block$3(ctx) {
    	let folderwsbutton;
    	let current;

    	folderwsbutton = new FolderWSButton({
    			props: {
    				selected: /*selected*/ ctx[3],
    				exclude: /*exclude*/ ctx[4],
    				folderName: /*startFolder*/ ctx[8],
    				location: /*path*/ ctx[2] + "/" + /*startFolder*/ ctx[8],
    				$$slots: {
    					subfolders: [create_subfolders_slot$1],
    					folderName: [create_folderName_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	folderwsbutton.$on("folderClicked", /*folderClicked_handler_1*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(folderwsbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(folderwsbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const folderwsbutton_changes = {};
    			if (dirty & /*selected*/ 8) folderwsbutton_changes.selected = /*selected*/ ctx[3];
    			if (dirty & /*exclude*/ 16) folderwsbutton_changes.exclude = /*exclude*/ ctx[4];
    			if (dirty & /*currentFolder*/ 1) folderwsbutton_changes.folderName = /*startFolder*/ ctx[8];
    			if (dirty & /*path, currentFolder*/ 5) folderwsbutton_changes.location = /*path*/ ctx[2] + "/" + /*startFolder*/ ctx[8];

    			if (dirty & /*$$scope, RecursiveFolders, selected, exclude, currentFolder, path*/ 2079) {
    				folderwsbutton_changes.$$scope = { dirty, ctx };
    			}

    			folderwsbutton.$set(folderwsbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(folderwsbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(folderwsbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(folderwsbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(22:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#if (Object.keys(currentFolder[startFolder]).length === 0) | (Object.keys(currentFolder[startFolder]).length === 1 && Object.keys(currentFolder[startFolder])[0] === "G_files")}
    function create_if_block_1$2(ctx) {
    	let folderbutton;
    	let current;

    	folderbutton = new FolderButton({
    			props: {
    				selected: /*selected*/ ctx[3],
    				exclude: /*exclude*/ ctx[4],
    				folderName: /*startFolder*/ ctx[8],
    				location: /*path*/ ctx[2] + "/" + /*startFolder*/ ctx[8],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	folderbutton.$on("folderClicked", /*folderClicked_handler*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(folderbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(folderbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const folderbutton_changes = {};
    			if (dirty & /*selected*/ 8) folderbutton_changes.selected = /*selected*/ ctx[3];
    			if (dirty & /*exclude*/ 16) folderbutton_changes.exclude = /*exclude*/ ctx[4];
    			if (dirty & /*currentFolder*/ 1) folderbutton_changes.folderName = /*startFolder*/ ctx[8];
    			if (dirty & /*path, currentFolder*/ 5) folderbutton_changes.location = /*path*/ ctx[2] + "/" + /*startFolder*/ ctx[8];

    			if (dirty & /*$$scope, currentFolder*/ 2049) {
    				folderbutton_changes.$$scope = { dirty, ctx };
    			}

    			folderbutton.$set(folderbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(folderbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(folderbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(folderbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(14:4) {#if (Object.keys(currentFolder[startFolder]).length === 0) | (Object.keys(currentFolder[startFolder]).length === 1 && Object.keys(currentFolder[startFolder])[0] === \\\"G_files\\\")}",
    		ctx
    	});

    	return block;
    }

    // (30:8) 
    function create_folderName_slot$1(ctx) {
    	let span;
    	let t_value = /*startFolder*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "slot", "folderName");
    			add_location(span, file$8, 29, 8, 964);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentFolder*/ 1 && t_value !== (t_value = /*startFolder*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_folderName_slot$1.name,
    		type: "slot",
    		source: "(30:8) ",
    		ctx
    	});

    	return block;
    }

    // (31:8) 
    function create_subfolders_slot$1(ctx) {
    	let span;
    	let switch_instance;
    	let current;
    	var switch_value = /*RecursiveFolders*/ ctx[1];

    	function switch_props(ctx) {
    		return {
    			props: {
    				selected: /*selected*/ ctx[3],
    				exclude: /*exclude*/ ctx[4],
    				currentFolder: /*currentFolder*/ ctx[0][/*startFolder*/ ctx[8]],
    				path: /*path*/ ctx[2] + "/" + /*startFolder*/ ctx[8],
    				RecursiveFolders: /*RecursiveFolders*/ ctx[1]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("folderClicked", /*folderClicked_handler_2*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(span, "slot", "subfolders");
    			add_location(span, file$8, 30, 8, 1018);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*selected*/ 8) switch_instance_changes.selected = /*selected*/ ctx[3];
    			if (dirty & /*exclude*/ 16) switch_instance_changes.exclude = /*exclude*/ ctx[4];
    			if (dirty & /*currentFolder*/ 1) switch_instance_changes.currentFolder = /*currentFolder*/ ctx[0][/*startFolder*/ ctx[8]];
    			if (dirty & /*path, currentFolder*/ 5) switch_instance_changes.path = /*path*/ ctx[2] + "/" + /*startFolder*/ ctx[8];
    			if (dirty & /*RecursiveFolders*/ 2) switch_instance_changes.RecursiveFolders = /*RecursiveFolders*/ ctx[1];

    			if (switch_value !== (switch_value = /*RecursiveFolders*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("folderClicked", /*folderClicked_handler_2*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, span, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_subfolders_slot$1.name,
    		type: "slot",
    		source: "(31:8) ",
    		ctx
    	});

    	return block;
    }

    // (15:6) <FolderButton          {selected}          {exclude}          folderName={startFolder}          location={path + "/" + startFolder}          on:folderClicked>
    function create_default_slot$4(ctx) {
    	let t_value = /*startFolder*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentFolder*/ 1 && t_value !== (t_value = /*startFolder*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(15:6) <FolderButton          {selected}          {exclude}          folderName={startFolder}          location={path + \\\"/\\\" + startFolder}          on:folderClicked>",
    		ctx
    	});

    	return block;
    }

    // (12:0) {#each Object.keys(currentFolder) as startFolder (startFolder)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*startFolder*/ ctx[8] !== "G_files" && create_if_block$5(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty$1();
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*startFolder*/ ctx[8] !== "G_files") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*currentFolder*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(12:0) {#each Object.keys(currentFolder) as startFolder (startFolder)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = Object.keys(/*currentFolder*/ ctx[0]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*startFolder*/ ctx[8];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selected, exclude, Object, currentFolder, path, RecursiveFolders*/ 31) {
    				each_value = Object.keys(/*currentFolder*/ ctx[0]);
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$2, each_1_anchor, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FolderFilter', slots, []);
    	let { currentFolder } = $$props;
    	let { RecursiveFolders } = $$props;
    	let { path } = $$props;
    	let { selected } = $$props;
    	let { exclude } = $$props;
    	const writable_props = ['currentFolder', 'RecursiveFolders', 'path', 'selected', 'exclude'];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FolderFilter> was created with unknown prop '${key}'`);
    	});

    	function folderClicked_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function folderClicked_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function folderClicked_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('currentFolder' in $$props) $$invalidate(0, currentFolder = $$props.currentFolder);
    		if ('RecursiveFolders' in $$props) $$invalidate(1, RecursiveFolders = $$props.RecursiveFolders);
    		if ('path' in $$props) $$invalidate(2, path = $$props.path);
    		if ('selected' in $$props) $$invalidate(3, selected = $$props.selected);
    		if ('exclude' in $$props) $$invalidate(4, exclude = $$props.exclude);
    	};

    	$$self.$capture_state = () => ({
    		FolderButton,
    		FolderWSButton,
    		currentFolder,
    		RecursiveFolders,
    		path,
    		selected,
    		exclude
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentFolder' in $$props) $$invalidate(0, currentFolder = $$props.currentFolder);
    		if ('RecursiveFolders' in $$props) $$invalidate(1, RecursiveFolders = $$props.RecursiveFolders);
    		if ('path' in $$props) $$invalidate(2, path = $$props.path);
    		if ('selected' in $$props) $$invalidate(3, selected = $$props.selected);
    		if ('exclude' in $$props) $$invalidate(4, exclude = $$props.exclude);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentFolder*/ 1) ;
    	};

    	return [
    		currentFolder,
    		RecursiveFolders,
    		path,
    		selected,
    		exclude,
    		folderClicked_handler,
    		folderClicked_handler_2,
    		folderClicked_handler_1
    	];
    }

    class FolderFilter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			currentFolder: 0,
    			RecursiveFolders: 1,
    			path: 2,
    			selected: 3,
    			exclude: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FolderFilter",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentFolder*/ ctx[0] === undefined && !('currentFolder' in props)) {
    			console.warn("<FolderFilter> was created without expected prop 'currentFolder'");
    		}

    		if (/*RecursiveFolders*/ ctx[1] === undefined && !('RecursiveFolders' in props)) {
    			console.warn("<FolderFilter> was created without expected prop 'RecursiveFolders'");
    		}

    		if (/*path*/ ctx[2] === undefined && !('path' in props)) {
    			console.warn("<FolderFilter> was created without expected prop 'path'");
    		}

    		if (/*selected*/ ctx[3] === undefined && !('selected' in props)) {
    			console.warn("<FolderFilter> was created without expected prop 'selected'");
    		}

    		if (/*exclude*/ ctx[4] === undefined && !('exclude' in props)) {
    			console.warn("<FolderFilter> was created without expected prop 'exclude'");
    		}
    	}

    	get currentFolder() {
    		throw new Error("<FolderFilter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentFolder(value) {
    		throw new Error("<FolderFilter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get RecursiveFolders() {
    		throw new Error("<FolderFilter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set RecursiveFolders(value) {
    		throw new Error("<FolderFilter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<FolderFilter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<FolderFilter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<FolderFilter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<FolderFilter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exclude() {
    		throw new Error("<FolderFilter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exclude(value) {
    		throw new Error("<FolderFilter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\BuildFolderStruct.svelte generated by Svelte v3.48.0 */

    const { Object: Object_1 } = globals;
    const file$7 = "src\\components\\BuildFolderStruct.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (21:4) {#if startFolder !== "G_files"}
    function create_if_block$4(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*folders*/ 1) show_if = null;
    		if (show_if == null) show_if = !!(Object.keys(/*folders*/ ctx[0][/*startFolder*/ ctx[8]]).length === 0 | (Object.keys(/*folders*/ ctx[0][/*startFolder*/ ctx[8]]).length === 1 && Object.keys(/*folders*/ ctx[0][/*startFolder*/ ctx[8]])[0] === "G_files"));
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(21:4) {#if startFolder !== \\\"G_files\\\"}",
    		ctx
    	});

    	return block;
    }

    // (36:6) {:else}
    function create_else_block$2(ctx) {
    	let folderwsbutton;
    	let current;

    	folderwsbutton = new FolderWSButton({
    			props: {
    				exclude: /*exclude*/ ctx[2],
    				selected: /*selected*/ ctx[1],
    				folderName: /*startFolder*/ ctx[8],
    				location: /*startFolder*/ ctx[8],
    				$$slots: {
    					subfolders: [create_subfolders_slot],
    					folderName: [create_folderName_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	folderwsbutton.$on("folderClicked", /*folderClicked_handler_2*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(folderwsbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(folderwsbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const folderwsbutton_changes = {};
    			if (dirty & /*exclude*/ 4) folderwsbutton_changes.exclude = /*exclude*/ ctx[2];
    			if (dirty & /*selected*/ 2) folderwsbutton_changes.selected = /*selected*/ ctx[1];
    			if (dirty & /*folders*/ 1) folderwsbutton_changes.folderName = /*startFolder*/ ctx[8];
    			if (dirty & /*folders*/ 1) folderwsbutton_changes.location = /*startFolder*/ ctx[8];

    			if (dirty & /*$$scope, selected, exclude, folders*/ 2055) {
    				folderwsbutton_changes.$$scope = { dirty, ctx };
    			}

    			folderwsbutton.$set(folderwsbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(folderwsbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(folderwsbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(folderwsbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(36:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:6) {#if (Object.keys(folders[startFolder]).length === 0) | (Object.keys(folders[startFolder]).length === 1 && Object.keys(folders[startFolder])[0] === "G_files")}
    function create_if_block_1$1(ctx) {
    	let folderbutton;
    	let current;

    	folderbutton = new FolderButton({
    			props: {
    				exclude: /*exclude*/ ctx[2],
    				selected: /*selected*/ ctx[1],
    				folderName: /*startFolder*/ ctx[8],
    				location: /*startFolder*/ ctx[8],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	folderbutton.$on("folderClicked", /*folderClicked_handler_1*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(folderbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(folderbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const folderbutton_changes = {};
    			if (dirty & /*exclude*/ 4) folderbutton_changes.exclude = /*exclude*/ ctx[2];
    			if (dirty & /*selected*/ 2) folderbutton_changes.selected = /*selected*/ ctx[1];
    			if (dirty & /*folders*/ 1) folderbutton_changes.folderName = /*startFolder*/ ctx[8];
    			if (dirty & /*folders*/ 1) folderbutton_changes.location = /*startFolder*/ ctx[8];

    			if (dirty & /*$$scope, folders*/ 2049) {
    				folderbutton_changes.$$scope = { dirty, ctx };
    			}

    			folderbutton.$set(folderbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(folderbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(folderbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(folderbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(22:6) {#if (Object.keys(folders[startFolder]).length === 0) | (Object.keys(folders[startFolder]).length === 1 && Object.keys(folders[startFolder])[0] === \\\"G_files\\\")}",
    		ctx
    	});

    	return block;
    }

    // (50:10) 
    function create_folderName_slot(ctx) {
    	let span;
    	let t_value = /*startFolder*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "slot", "folderName");
    			add_location(span, file$7, 49, 10, 1546);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*folders*/ 1 && t_value !== (t_value = /*startFolder*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_folderName_slot.name,
    		type: "slot",
    		source: "(50:10) ",
    		ctx
    	});

    	return block;
    }

    // (51:10) 
    function create_subfolders_slot(ctx) {
    	let span;
    	let folderfilter;
    	let current;

    	folderfilter = new FolderFilter({
    			props: {
    				selected: /*selected*/ ctx[1],
    				exclude: /*exclude*/ ctx[2],
    				path: /*startFolder*/ ctx[8],
    				currentFolder: /*folders*/ ctx[0][/*startFolder*/ ctx[8]],
    				RecursiveFolders: FolderFilter
    			},
    			$$inline: true
    		});

    	folderfilter.$on("folderClicked", /*folderClicked_handler*/ ctx[6]);

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(folderfilter.$$.fragment);
    			attr_dev(span, "slot", "subfolders");
    			add_location(span, file$7, 50, 10, 1602);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(folderfilter, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const folderfilter_changes = {};
    			if (dirty & /*selected*/ 2) folderfilter_changes.selected = /*selected*/ ctx[1];
    			if (dirty & /*exclude*/ 4) folderfilter_changes.exclude = /*exclude*/ ctx[2];
    			if (dirty & /*folders*/ 1) folderfilter_changes.path = /*startFolder*/ ctx[8];
    			if (dirty & /*folders*/ 1) folderfilter_changes.currentFolder = /*folders*/ ctx[0][/*startFolder*/ ctx[8]];
    			folderfilter.$set(folderfilter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(folderfilter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(folderfilter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(folderfilter);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_subfolders_slot.name,
    		type: "slot",
    		source: "(51:10) ",
    		ctx
    	});

    	return block;
    }

    // (23:8) <FolderButton            {exclude}            {selected}            folderName={startFolder}            location={startFolder}            on:folderClicked={(e) => {              if (currentFolder === e.detail) {                dispatch("folderClicked", currentFolder);              } else {                currentFolder = e.detail;              }            }}>
    function create_default_slot$3(ctx) {
    	let t_value = /*startFolder*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*folders*/ 1 && t_value !== (t_value = /*startFolder*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(23:8) <FolderButton            {exclude}            {selected}            folderName={startFolder}            location={startFolder}            on:folderClicked={(e) => {              if (currentFolder === e.detail) {                dispatch(\\\"folderClicked\\\", currentFolder);              } else {                currentFolder = e.detail;              }            }}>",
    		ctx
    	});

    	return block;
    }

    // (20:2) {#each Object.keys(folders) as startFolder (startFolder)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*startFolder*/ ctx[8] !== "G_files" && create_if_block$4(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty$1();
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*startFolder*/ ctx[8] !== "G_files") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*folders*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(20:2) {#each Object.keys(folders) as startFolder (startFolder)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = Object.keys(/*folders*/ ctx[0]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*startFolder*/ ctx[8];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-1t5ivdk");
    			add_location(ul, file$7, 18, 0, 458);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*exclude, selected, Object, folders, currentFolder, dispatch, FolderFilter*/ 31) {
    				each_value = Object.keys(/*folders*/ ctx[0]);
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BuildFolderStruct', slots, []);
    	let { folders } = $$props;
    	let { selected } = $$props;
    	let { exclude } = $$props;
    	const dispatch = createEventDispatcher();
    	let currentFolder = "";
    	const writable_props = ['folders', 'selected', 'exclude'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BuildFolderStruct> was created with unknown prop '${key}'`);
    	});

    	const folderClicked_handler_1 = e => {
    		if (currentFolder === e.detail) {
    			dispatch("folderClicked", currentFolder);
    		} else {
    			$$invalidate(3, currentFolder = e.detail);
    		}
    	};

    	function folderClicked_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const folderClicked_handler_2 = e => {
    		if (currentFolder === e.detail) {
    			dispatch("folderClicked", currentFolder);
    		} else {
    			$$invalidate(3, currentFolder = e.detail);
    		}
    	};

    	$$self.$$set = $$props => {
    		if ('folders' in $$props) $$invalidate(0, folders = $$props.folders);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('exclude' in $$props) $$invalidate(2, exclude = $$props.exclude);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		FolderButton,
    		FolderWSButton,
    		FolderFilter,
    		folders,
    		selected,
    		exclude,
    		dispatch,
    		currentFolder
    	});

    	$$self.$inject_state = $$props => {
    		if ('folders' in $$props) $$invalidate(0, folders = $$props.folders);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('exclude' in $$props) $$invalidate(2, exclude = $$props.exclude);
    		if ('currentFolder' in $$props) $$invalidate(3, currentFolder = $$props.currentFolder);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*folders*/ 1) ;

    		if ($$self.$$.dirty & /*currentFolder*/ 8) {
    			{
    				dispatch("folderClicked", currentFolder);
    			}
    		}
    	};

    	return [
    		folders,
    		selected,
    		exclude,
    		currentFolder,
    		dispatch,
    		folderClicked_handler_1,
    		folderClicked_handler,
    		folderClicked_handler_2
    	];
    }

    class BuildFolderStruct extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { folders: 0, selected: 1, exclude: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BuildFolderStruct",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*folders*/ ctx[0] === undefined && !('folders' in props)) {
    			console.warn("<BuildFolderStruct> was created without expected prop 'folders'");
    		}

    		if (/*selected*/ ctx[1] === undefined && !('selected' in props)) {
    			console.warn("<BuildFolderStruct> was created without expected prop 'selected'");
    		}

    		if (/*exclude*/ ctx[2] === undefined && !('exclude' in props)) {
    			console.warn("<BuildFolderStruct> was created without expected prop 'exclude'");
    		}
    	}

    	get folders() {
    		throw new Error("<BuildFolderStruct>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set folders(value) {
    		throw new Error("<BuildFolderStruct>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<BuildFolderStruct>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<BuildFolderStruct>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exclude() {
    		throw new Error("<BuildFolderStruct>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exclude(value) {
    		throw new Error("<BuildFolderStruct>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Option.svelte generated by Svelte v3.48.0 */
    const file$6 = "src\\components\\Option.svelte";

    function create_fragment$9(ctx) {
    	let button;
    	let img;
    	let img_src_value;
    	let t;
    	let p;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			t = space();
    			p = element("p");
    			if (default_slot) default_slot.c();
    			if (!src_url_equal(img.src, img_src_value = /*icon*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*alt*/ ctx[2]);
    			attr_dev(img, "class", "svelte-19iuwlz");
    			add_location(img, file$6, 17, 2, 385);
    			attr_dev(p, "class", "svelte-19iuwlz");
    			add_location(p, file$6, 18, 2, 413);
    			attr_dev(button, "class", button_class_value = "option " + (/*nonSelectable*/ ctx[0] ? 'non-selectable' : '') + " svelte-19iuwlz");
    			add_location(button, file$6, 9, 0, 208);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img);
    			append_dev(button, t);
    			append_dev(button, p);

    			if (default_slot) {
    				default_slot.m(p, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*icon*/ 2 && !src_url_equal(img.src, img_src_value = /*icon*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*alt*/ 4) {
    				attr_dev(img, "alt", /*alt*/ ctx[2]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*nonSelectable*/ 1 && button_class_value !== (button_class_value = "option " + (/*nonSelectable*/ ctx[0] ? 'non-selectable' : '') + " svelte-19iuwlz")) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Option', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { nonSelectable } = $$props;
    	let { icon } = $$props;
    	let { alt } = $$props;
    	let { ident } = $$props;
    	const writable_props = ['nonSelectable', 'icon', 'alt', 'ident'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Option> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		if (nonSelectable === false) {
    			dispatch("clicked", ident);
    		}
    	};

    	$$self.$$set = $$props => {
    		if ('nonSelectable' in $$props) $$invalidate(0, nonSelectable = $$props.nonSelectable);
    		if ('icon' in $$props) $$invalidate(1, icon = $$props.icon);
    		if ('alt' in $$props) $$invalidate(2, alt = $$props.alt);
    		if ('ident' in $$props) $$invalidate(3, ident = $$props.ident);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		nonSelectable,
    		icon,
    		alt,
    		ident
    	});

    	$$self.$inject_state = $$props => {
    		if ('nonSelectable' in $$props) $$invalidate(0, nonSelectable = $$props.nonSelectable);
    		if ('icon' in $$props) $$invalidate(1, icon = $$props.icon);
    		if ('alt' in $$props) $$invalidate(2, alt = $$props.alt);
    		if ('ident' in $$props) $$invalidate(3, ident = $$props.ident);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nonSelectable, icon, alt, ident, dispatch, $$scope, slots, click_handler];
    }

    class Option extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			nonSelectable: 0,
    			icon: 1,
    			alt: 2,
    			ident: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Option",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nonSelectable*/ ctx[0] === undefined && !('nonSelectable' in props)) {
    			console.warn("<Option> was created without expected prop 'nonSelectable'");
    		}

    		if (/*icon*/ ctx[1] === undefined && !('icon' in props)) {
    			console.warn("<Option> was created without expected prop 'icon'");
    		}

    		if (/*alt*/ ctx[2] === undefined && !('alt' in props)) {
    			console.warn("<Option> was created without expected prop 'alt'");
    		}

    		if (/*ident*/ ctx[3] === undefined && !('ident' in props)) {
    			console.warn("<Option> was created without expected prop 'ident'");
    		}
    	}

    	get nonSelectable() {
    		throw new Error("<Option>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nonSelectable(value) {
    		throw new Error("<Option>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Option>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Option>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<Option>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<Option>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ident() {
    		throw new Error("<Option>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ident(value) {
    		throw new Error("<Option>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\RightClick.svelte generated by Svelte v3.48.0 */

    const { console: console_1$1 } = globals;
    const file$5 = "src\\components\\RightClick.svelte";

    // (33:2) <Option      icon="/icons/folder-plus.svg"      alt="New folder icon"      on:clicked={newFolder}      nonSelectable={false}      ident="newFolder"    >
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("New Folder");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(33:2) <Option      icon=\\\"/icons/folder-plus.svg\\\"      alt=\\\"New folder icon\\\"      on:clicked={newFolder}      nonSelectable={false}      ident=\\\"newFolder\\\"    >",
    		ctx
    	});

    	return block;
    }

    // (42:2) <Option      icon="/icons/share.svg"      alt="Share icon"      on:clicked={click}      nonSelectable={!selected ? true : false}      ident="share">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Share");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(42:2) <Option      icon=\\\"/icons/share.svg\\\"      alt=\\\"Share icon\\\"      on:clicked={click}      nonSelectable={!selected ? true : false}      ident=\\\"share\\\">",
    		ctx
    	});

    	return block;
    }

    // (49:2) <Option      icon="/icons/move.svg"      nonSelectable={!selected ? true : false}      alt="Move icon"      on:clicked={moveFolder}      ident="move">
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Move");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(49:2) <Option      icon=\\\"/icons/move.svg\\\"      nonSelectable={!selected ? true : false}      alt=\\\"Move icon\\\"      on:clicked={moveFolder}      ident=\\\"move\\\">",
    		ctx
    	});

    	return block;
    }

    // (56:2) <Option      ident="rename"      icon="/icons/input-cursor-text.svg"      alt="Rename icon"      nonSelectable={!selected ? true : false}      on:clicked={renameFolder}>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Rename");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(56:2) <Option      ident=\\\"rename\\\"      icon=\\\"/icons/input-cursor-text.svg\\\"      alt=\\\"Rename icon\\\"      nonSelectable={!selected ? true : false}      on:clicked={renameFolder}>",
    		ctx
    	});

    	return block;
    }

    // (63:2) <Option      ident="delete"      icon="/icons/trash.svg"      alt="Delete"      nonSelectable={!selected ? true : false}      on:clicked={deleteFolder}    >
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Delete");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(63:2) <Option      ident=\\\"delete\\\"      icon=\\\"/icons/trash.svg\\\"      alt=\\\"Delete\\\"      nonSelectable={!selected ? true : false}      on:clicked={deleteFolder}    >",
    		ctx
    	});

    	return block;
    }

    // (73:2) <Option      ident="settings"      icon="/icons/gear.svg"      alt="Settings"      nonSelectable={false}      on:clicked={click}    >
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Settings");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(73:2) <Option      ident=\\\"settings\\\"      icon=\\\"/icons/gear.svg\\\"      alt=\\\"Settings\\\"      nonSelectable={false}      on:clicked={click}    >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section;
    	let option0;
    	let t0;
    	let option1;
    	let t1;
    	let option2;
    	let t2;
    	let option3;
    	let t3;
    	let option4;
    	let t4;
    	let div;
    	let t5;
    	let option5;
    	let current;

    	option0 = new Option({
    			props: {
    				icon: "/icons/folder-plus.svg",
    				alt: "New folder icon",
    				nonSelectable: false,
    				ident: "newFolder",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	option0.$on("clicked", /*newFolder*/ ctx[2]);

    	option1 = new Option({
    			props: {
    				icon: "/icons/share.svg",
    				alt: "Share icon",
    				nonSelectable: !/*selected*/ ctx[0] ? true : false,
    				ident: "share",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	option1.$on("clicked", /*click*/ ctx[1]);

    	option2 = new Option({
    			props: {
    				icon: "/icons/move.svg",
    				nonSelectable: !/*selected*/ ctx[0] ? true : false,
    				alt: "Move icon",
    				ident: "move",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	option2.$on("clicked", /*moveFolder*/ ctx[5]);

    	option3 = new Option({
    			props: {
    				ident: "rename",
    				icon: "/icons/input-cursor-text.svg",
    				alt: "Rename icon",
    				nonSelectable: !/*selected*/ ctx[0] ? true : false,
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	option3.$on("clicked", /*renameFolder*/ ctx[3]);

    	option4 = new Option({
    			props: {
    				ident: "delete",
    				icon: "/icons/trash.svg",
    				alt: "Delete",
    				nonSelectable: !/*selected*/ ctx[0] ? true : false,
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	option4.$on("clicked", /*deleteFolder*/ ctx[4]);

    	option5 = new Option({
    			props: {
    				ident: "settings",
    				icon: "/icons/gear.svg",
    				alt: "Settings",
    				nonSelectable: false,
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	option5.$on("clicked", /*click*/ ctx[1]);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(option0.$$.fragment);
    			t0 = space();
    			create_component(option1.$$.fragment);
    			t1 = space();
    			create_component(option2.$$.fragment);
    			t2 = space();
    			create_component(option3.$$.fragment);
    			t3 = space();
    			create_component(option4.$$.fragment);
    			t4 = space();
    			div = element("div");
    			t5 = space();
    			create_component(option5.$$.fragment);
    			attr_dev(div, "class", "break svelte-1go7m9p");
    			add_location(div, file$5, 71, 2, 1674);
    			attr_dev(section, "class", "right-click svelte-1go7m9p");
    			add_location(section, file$5, 31, 0, 738);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(option0, section, null);
    			append_dev(section, t0);
    			mount_component(option1, section, null);
    			append_dev(section, t1);
    			mount_component(option2, section, null);
    			append_dev(section, t2);
    			mount_component(option3, section, null);
    			append_dev(section, t3);
    			mount_component(option4, section, null);
    			append_dev(section, t4);
    			append_dev(section, div);
    			append_dev(section, t5);
    			mount_component(option5, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const option0_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				option0_changes.$$scope = { dirty, ctx };
    			}

    			option0.$set(option0_changes);
    			const option1_changes = {};
    			if (dirty & /*selected*/ 1) option1_changes.nonSelectable = !/*selected*/ ctx[0] ? true : false;

    			if (dirty & /*$$scope*/ 128) {
    				option1_changes.$$scope = { dirty, ctx };
    			}

    			option1.$set(option1_changes);
    			const option2_changes = {};
    			if (dirty & /*selected*/ 1) option2_changes.nonSelectable = !/*selected*/ ctx[0] ? true : false;

    			if (dirty & /*$$scope*/ 128) {
    				option2_changes.$$scope = { dirty, ctx };
    			}

    			option2.$set(option2_changes);
    			const option3_changes = {};
    			if (dirty & /*selected*/ 1) option3_changes.nonSelectable = !/*selected*/ ctx[0] ? true : false;

    			if (dirty & /*$$scope*/ 128) {
    				option3_changes.$$scope = { dirty, ctx };
    			}

    			option3.$set(option3_changes);
    			const option4_changes = {};
    			if (dirty & /*selected*/ 1) option4_changes.nonSelectable = !/*selected*/ ctx[0] ? true : false;

    			if (dirty & /*$$scope*/ 128) {
    				option4_changes.$$scope = { dirty, ctx };
    			}

    			option4.$set(option4_changes);
    			const option5_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				option5_changes.$$scope = { dirty, ctx };
    			}

    			option5.$set(option5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(option0.$$.fragment, local);
    			transition_in(option1.$$.fragment, local);
    			transition_in(option2.$$.fragment, local);
    			transition_in(option3.$$.fragment, local);
    			transition_in(option4.$$.fragment, local);
    			transition_in(option5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(option0.$$.fragment, local);
    			transition_out(option1.$$.fragment, local);
    			transition_out(option2.$$.fragment, local);
    			transition_out(option3.$$.fragment, local);
    			transition_out(option4.$$.fragment, local);
    			transition_out(option5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(option0);
    			destroy_component(option1);
    			destroy_component(option2);
    			destroy_component(option3);
    			destroy_component(option4);
    			destroy_component(option5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RightClick', slots, []);
    	const dispatch = createEventDispatcher();
    	let { selected } = $$props;

    	const click = e => {
    		console.log(e.detail, selected);
    	};

    	const newFolder = e => {
    		dispatch("new-folder", { selected, det: e.detail });
    		dispatch("close-right", true);
    	};

    	const renameFolder = () => {
    		dispatch("rename-folder", selected);
    		dispatch("close-right", true);
    	};

    	const deleteFolder = () => {
    		dispatch("delete-folder", selected);
    		dispatch("close-right", true);
    	};

    	const moveFolder = () => {
    		dispatch("move-folder", selected);
    		dispatch("close-right", true);
    	};

    	const writable_props = ['selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<RightClick> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		Option,
    		selected,
    		click,
    		newFolder,
    		renameFolder,
    		deleteFolder,
    		moveFolder
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, click, newFolder, renameFolder, deleteFolder, moveFolder];
    }

    class RightClick extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { selected: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RightClick",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selected*/ ctx[0] === undefined && !('selected' in props)) {
    			console_1$1.warn("<RightClick> was created without expected prop 'selected'");
    		}
    	}

    	get selected() {
    		throw new Error("<RightClick>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<RightClick>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\FolderPart.svelte generated by Svelte v3.48.0 */
    const file$4 = "src\\components\\FolderPart.svelte";

    function create_fragment$7(ctx) {
    	let section0;
    	let rightclick;
    	let t0;
    	let button;
    	let img;
    	let img_src_value;
    	let t1;
    	let section2;
    	let section1;
    	let p;
    	let t2_value = /*userData*/ ctx[0].usersRName + "";
    	let t2;
    	let t3;
    	let buildfolderstruct;
    	let current;
    	let mounted;
    	let dispose;
    	let rightclick_props = { selected: /*selected*/ ctx[2] };
    	rightclick = new RightClick({ props: rightclick_props, $$inline: true });
    	/*rightclick_binding*/ ctx[6](rightclick);
    	rightclick.$on("new-folder", /*new_folder_handler*/ ctx[7]);
    	rightclick.$on("rename-folder", /*rename_folder_handler*/ ctx[8]);
    	rightclick.$on("delete-folder", /*delete_folder_handler*/ ctx[9]);
    	rightclick.$on("move-folder", /*move_folder_handler*/ ctx[10]);
    	rightclick.$on("close-right", /*hideRightClick*/ ctx[4]);

    	buildfolderstruct = new BuildFolderStruct({
    			props: {
    				folders: /*folderStruct*/ ctx[1],
    				selected: /*selected*/ ctx[2],
    				exclude: false
    			},
    			$$inline: true
    		});

    	buildfolderstruct.$on("folderClicked", /*folderClicked_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			create_component(rightclick.$$.fragment);
    			t0 = space();
    			button = element("button");
    			img = element("img");
    			t1 = space();
    			section2 = element("section");
    			section1 = element("section");
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			create_component(buildfolderstruct.$$.fragment);
    			attr_dev(section0, "class", "right-click svelte-4ogke0");
    			add_location(section0, file$4, 53, 0, 1432);
    			if (!src_url_equal(img.src, img_src_value = "/icons/folder-fill.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Folder");
    			attr_dev(img, "class", "svelte-4ogke0");
    			add_location(img, file$4, 75, 5, 2152);
    			attr_dev(button, "class", "folder-part-button svelte-4ogke0");
    			attr_dev(button, "id", "folderpartbutton");
    			add_location(button, file$4, 64, 0, 1685);
    			attr_dev(p, "class", "svelte-4ogke0");
    			add_location(p, file$4, 83, 4, 2352);
    			attr_dev(section1, "class", "name-section svelte-4ogke0");
    			add_location(section1, file$4, 82, 2, 2316);
    			attr_dev(section2, "class", "folder-part svelte-4ogke0");
    			attr_dev(section2, "id", "folder-part");
    			add_location(section2, file$4, 77, 0, 2214);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			mount_component(rightclick, section0, null);
    			/*section0_binding*/ ctx[11](section0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, img);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, section1);
    			append_dev(section1, p);
    			append_dev(p, t2);
    			append_dev(section2, t3);
    			mount_component(buildfolderstruct, section2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(section2, "contextmenu", prevent_default(/*menuShow*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const rightclick_changes = {};
    			if (dirty & /*selected*/ 4) rightclick_changes.selected = /*selected*/ ctx[2];
    			rightclick.$set(rightclick_changes);
    			if ((!current || dirty & /*userData*/ 1) && t2_value !== (t2_value = /*userData*/ ctx[0].usersRName + "")) set_data_dev(t2, t2_value);
    			const buildfolderstruct_changes = {};
    			if (dirty & /*folderStruct*/ 2) buildfolderstruct_changes.folders = /*folderStruct*/ ctx[1];
    			if (dirty & /*selected*/ 4) buildfolderstruct_changes.selected = /*selected*/ ctx[2];
    			buildfolderstruct.$set(buildfolderstruct_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rightclick.$$.fragment, local);
    			transition_in(buildfolderstruct.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rightclick.$$.fragment, local);
    			transition_out(buildfolderstruct.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			/*rightclick_binding*/ ctx[6](null);
    			destroy_component(rightclick);
    			/*section0_binding*/ ctx[11](null);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(section2);
    			destroy_component(buildfolderstruct);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FolderPart', slots, []);
    	let { userData } = $$props;
    	let { folderStruct } = $$props;
    	let { selected } = $$props;
    	let contextMenu;

    	const hideRightClick = () => {
    		$$invalidate(3, contextMenu.style.visibility = "hidden", contextMenu);
    	};

    	const menuShow = e => {
    		let x = e.pageX,
    			y = e.pageY,
    			winWidth = window.innerWidth,
    			winHeight = window.innerHeight,
    			cmWidth = contextMenu.offsetWidth,
    			cmHeight = contextMenu.offsetHeight;

    		$$invalidate(3, contextMenu.style.left = `${x > winWidth - cmWidth ? winWidth - cmWidth : x}px`, contextMenu);
    		$$invalidate(3, contextMenu.style.top = `${y > winHeight - cmHeight ? winHeight - cmHeight : y}px`, contextMenu);
    		$$invalidate(3, contextMenu.style.visibility = "visible", contextMenu);
    	};

    	document.addEventListener("click", e => {
    		if (!contextMenu) {
    			return;
    		}

    		if (contextMenu.style.visibility !== "visible") {
    			return;
    		}

    		const pos = {
    			x: parseInt(contextMenu.style.left.replace("px", "")),
    			y: parseInt(contextMenu.style.top.replace("px", "")),
    			width: contextMenu.offsetWidth,
    			height: contextMenu.offsetHeight
    		};

    		if (pos.x + pos.width >= e.pageX && e.pageX >= pos.x && pos.y + pos.height >= e.pageY && e.pageY >= pos.y) {
    			return;
    		}

    		hideRightClick();
    	});

    	const writable_props = ['userData', 'folderStruct', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FolderPart> was created with unknown prop '${key}'`);
    	});

    	function rightclick_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			contextMenu = $$value;
    			$$invalidate(3, contextMenu);
    		});
    	}

    	function new_folder_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function rename_folder_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function delete_folder_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function move_folder_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function section0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			contextMenu = $$value;
    			$$invalidate(3, contextMenu);
    		});
    	}

    	const click_handler = () => {
    		if (document.getElementById("folderpartbutton").style.right === "215px") {
    			document.getElementById("folderpartbutton").style.right = "5px";
    			document.getElementById("folder-part").style.right = "-300px";
    			return;
    		}

    		document.getElementById("folderpartbutton").style.right = "215px";
    		document.getElementById("folder-part").style.right = 0;
    	};

    	function folderClicked_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('userData' in $$props) $$invalidate(0, userData = $$props.userData);
    		if ('folderStruct' in $$props) $$invalidate(1, folderStruct = $$props.folderStruct);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({
    		BuildFolderStruct,
    		RightClick,
    		userData,
    		folderStruct,
    		selected,
    		contextMenu,
    		hideRightClick,
    		menuShow
    	});

    	$$self.$inject_state = $$props => {
    		if ('userData' in $$props) $$invalidate(0, userData = $$props.userData);
    		if ('folderStruct' in $$props) $$invalidate(1, folderStruct = $$props.folderStruct);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('contextMenu' in $$props) $$invalidate(3, contextMenu = $$props.contextMenu);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*folderStruct*/ 2) ;
    	};

    	return [
    		userData,
    		folderStruct,
    		selected,
    		contextMenu,
    		hideRightClick,
    		menuShow,
    		rightclick_binding,
    		new_folder_handler,
    		rename_folder_handler,
    		delete_folder_handler,
    		move_folder_handler,
    		section0_binding,
    		click_handler,
    		folderClicked_handler
    	];
    }

    class FolderPart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			userData: 0,
    			folderStruct: 1,
    			selected: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FolderPart",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*userData*/ ctx[0] === undefined && !('userData' in props)) {
    			console.warn("<FolderPart> was created without expected prop 'userData'");
    		}

    		if (/*folderStruct*/ ctx[1] === undefined && !('folderStruct' in props)) {
    			console.warn("<FolderPart> was created without expected prop 'folderStruct'");
    		}

    		if (/*selected*/ ctx[2] === undefined && !('selected' in props)) {
    			console.warn("<FolderPart> was created without expected prop 'selected'");
    		}
    	}

    	get userData() {
    		throw new Error("<FolderPart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userData(value) {
    		throw new Error("<FolderPart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get folderStruct() {
    		throw new Error("<FolderPart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set folderStruct(value) {
    		throw new Error("<FolderPart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<FolderPart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<FolderPart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\LocationPath.svelte generated by Svelte v3.48.0 */
    const file$3 = "src\\components\\LocationPath.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (27:2) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "home";
    			p = element("p");
    			p.textContent = "/";
    			attr_dev(button, "class", "svelte-z5nrg5");
    			add_location(button, file$3, 27, 4, 652);
    			attr_dev(p, "class", "svelte-z5nrg5");
    			add_location(p, file$3, 31, 5, 753);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, p, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(27:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (8:2) {#if selected}
    function create_if_block$3(ctx) {
    	let button;
    	let p;
    	let t2;
    	let each_1_anchor;
    	let mounted;
    	let dispose;
    	let each_value = /*selected*/ ctx[0].split("/");
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "home";
    			p = element("p");
    			p.textContent = "/";
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty$1();
    			attr_dev(button, "class", "svelte-z5nrg5");
    			add_location(button, file$3, 8, 4, 194);
    			attr_dev(p, "class", "svelte-z5nrg5");
    			add_location(p, file$3, 12, 5, 295);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dispatch, selected*/ 3) {
    				each_value = /*selected*/ ctx[0].split("/");
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(8:2) {#if selected}",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#each selected.split("/") as folderLocation, i}
    function create_each_block(ctx) {
    	let button;
    	let t0_value = /*folderLocation*/ ctx[5] + "";
    	let t0;
    	let p;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[3](/*i*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			p = element("p");
    			p.textContent = "/";
    			attr_dev(button, "class", "svelte-z5nrg5");
    			add_location(button, file$3, 14, 6, 365);
    			attr_dev(p, "class", "svelte-z5nrg5");
    			add_location(p, file$3, 24, 7, 614);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			insert_dev(target, p, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*selected*/ 1 && t0_value !== (t0_value = /*folderLocation*/ ctx[5] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(14:4) {#each selected.split(\\\"/\\\") as folderLocation, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section;

    	function select_block_type(ctx, dirty) {
    		if (/*selected*/ ctx[0]) return create_if_block$3;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if_block.c();
    			attr_dev(section, "class", "path-grid svelte-z5nrg5");
    			add_location(section, file$3, 6, 0, 143);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_block.m(section, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(section, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LocationPath', slots, []);
    	const dispatch = createEventDispatcher();
    	let { selected } = $$props;
    	const writable_props = ['selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LocationPath> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		dispatch("change-dir", null);
    	};

    	const click_handler_1 = i => {
    		dispatch("change-dir", selected.split("/").slice(0, i + 1).join("/"));
    	};

    	const click_handler_2 = () => {
    		dispatch("change-dir", null);
    	};

    	$$self.$$set = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		selected
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, dispatch, click_handler, click_handler_1, click_handler_2];
    }

    class LocationPath extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { selected: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LocationPath",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selected*/ ctx[0] === undefined && !('selected' in props)) {
    			console.warn("<LocationPath> was created without expected prop 'selected'");
    		}
    	}

    	get selected() {
    		throw new Error("<LocationPath>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<LocationPath>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Prompt.svelte generated by Svelte v3.48.0 */

    const file$2 = "src\\components\\Prompt.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let form;
    	let input;
    	let t0;
    	let button0;
    	let t2;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			form = element("form");
    			input = element("input");
    			t0 = space();
    			button0 = element("button");
    			button0.textContent = "Submit";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "✖";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*promptPlaceholder*/ ctx[0]);
    			attr_dev(input, "class", "svelte-kr8xbg");
    			add_location(input, file$2, 15, 6, 405);
    			attr_dev(button0, "type", "submit");
    			attr_dev(button0, "class", "svelte-kr8xbg");
    			add_location(button0, file$2, 16, 6, 466);
    			attr_dev(form, "class", "svelte-kr8xbg");
    			add_location(form, file$2, 14, 4, 329);
    			attr_dev(button1, "class", "close svelte-kr8xbg");
    			add_location(button1, file$2, 18, 4, 522);
    			attr_dev(div0, "class", "prompt-color svelte-kr8xbg");
    			add_location(div0, file$2, 13, 2, 297);
    			attr_dev(div1, "class", "prompt svelte-kr8xbg");
    			attr_dev(div1, "id", "coverPrompt");
    			add_location(div1, file$2, 12, 0, 236);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, form);
    			append_dev(form, input);
    			append_dev(form, t0);
    			append_dev(form, button0);
    			append_dev(div0, t2);
    			append_dev(div0, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[4]), false, true, false),
    					listen_dev(button1, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(div1, "click", /*divClick*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*promptPlaceholder*/ 1) {
    				attr_dev(input, "placeholder", /*promptPlaceholder*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Prompt', slots, []);
    	let { promptPlaceholder } = $$props;
    	let { promptEvent } = $$props;
    	let { promptExtra } = $$props;

    	const divClick = e => {
    		if (e.target.id === "coverPrompt") {
    			promptEvent(false, promptExtra);
    		}
    	};

    	const writable_props = ['promptPlaceholder', 'promptEvent', 'promptExtra'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Prompt> was created with unknown prop '${key}'`);
    	});

    	const submit_handler = e => promptEvent(e, promptExtra);
    	const click_handler = () => promptEvent(false, promptExtra);

    	$$self.$$set = $$props => {
    		if ('promptPlaceholder' in $$props) $$invalidate(0, promptPlaceholder = $$props.promptPlaceholder);
    		if ('promptEvent' in $$props) $$invalidate(1, promptEvent = $$props.promptEvent);
    		if ('promptExtra' in $$props) $$invalidate(2, promptExtra = $$props.promptExtra);
    	};

    	$$self.$capture_state = () => ({
    		promptPlaceholder,
    		promptEvent,
    		promptExtra,
    		divClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('promptPlaceholder' in $$props) $$invalidate(0, promptPlaceholder = $$props.promptPlaceholder);
    		if ('promptEvent' in $$props) $$invalidate(1, promptEvent = $$props.promptEvent);
    		if ('promptExtra' in $$props) $$invalidate(2, promptExtra = $$props.promptExtra);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		promptPlaceholder,
    		promptEvent,
    		promptExtra,
    		divClick,
    		submit_handler,
    		click_handler
    	];
    }

    class Prompt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			promptPlaceholder: 0,
    			promptEvent: 1,
    			promptExtra: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prompt",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*promptPlaceholder*/ ctx[0] === undefined && !('promptPlaceholder' in props)) {
    			console.warn("<Prompt> was created without expected prop 'promptPlaceholder'");
    		}

    		if (/*promptEvent*/ ctx[1] === undefined && !('promptEvent' in props)) {
    			console.warn("<Prompt> was created without expected prop 'promptEvent'");
    		}

    		if (/*promptExtra*/ ctx[2] === undefined && !('promptExtra' in props)) {
    			console.warn("<Prompt> was created without expected prop 'promptExtra'");
    		}
    	}

    	get promptPlaceholder() {
    		throw new Error("<Prompt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set promptPlaceholder(value) {
    		throw new Error("<Prompt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get promptEvent() {
    		throw new Error("<Prompt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set promptEvent(value) {
    		throw new Error("<Prompt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get promptExtra() {
    		throw new Error("<Prompt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set promptExtra(value) {
    		throw new Error("<Prompt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\MoveTo.svelte generated by Svelte v3.48.0 */
    const file$1 = "src\\components\\MoveTo.svelte";

    // (30:4) {#if mockSelected !== null}
    function create_if_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Move Here.";
    			attr_dev(button, "class", "move svelte-1jq0uz5");
    			add_location(button, file$1, 30, 6, 746);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(30:4) {#if mockSelected !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let div0;
    	let buildfolderstruct;
    	let t0;
    	let div1;
    	let t1;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	buildfolderstruct = new BuildFolderStruct({
    			props: {
    				folders: /*folderStruct*/ ctx[0],
    				exclude: /*exclude*/ ctx[1],
    				selected: /*mockSelected*/ ctx[2]
    			},
    			$$inline: true
    		});

    	buildfolderstruct.$on("folderClicked", /*moveToPlace*/ ctx[5]);
    	let if_block = /*mockSelected*/ ctx[2] !== null && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(buildfolderstruct.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			button = element("button");
    			button.textContent = "Cancel";
    			attr_dev(div0, "class", "info svelte-1jq0uz5");
    			add_location(div0, file$1, 20, 2, 504);
    			attr_dev(button, "class", "cancel svelte-1jq0uz5");
    			add_location(button, file$1, 38, 4, 948);
    			attr_dev(div1, "class", "buttons svelte-1jq0uz5");
    			add_location(div1, file$1, 28, 2, 684);
    			attr_dev(div2, "id", "cover");
    			attr_dev(div2, "class", "cover svelte-1jq0uz5");
    			add_location(div2, file$1, 19, 0, 449);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(buildfolderstruct, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler_1*/ ctx[7], false, false, false),
    					listen_dev(div2, "click", /*closeMove*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const buildfolderstruct_changes = {};
    			if (dirty & /*folderStruct*/ 1) buildfolderstruct_changes.folders = /*folderStruct*/ ctx[0];
    			if (dirty & /*exclude*/ 2) buildfolderstruct_changes.exclude = /*exclude*/ ctx[1];
    			if (dirty & /*mockSelected*/ 4) buildfolderstruct_changes.selected = /*mockSelected*/ ctx[2];
    			buildfolderstruct.$set(buildfolderstruct_changes);

    			if (/*mockSelected*/ ctx[2] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buildfolderstruct.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buildfolderstruct.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(buildfolderstruct);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MoveTo', slots, []);
    	const dispatch = createEventDispatcher();
    	let { folderStruct } = $$props;
    	let { exclude } = $$props;
    	let mockSelected = null;

    	const closeMove = e => {
    		if (e.target.id === "cover") {
    			dispatch("close-move", true);
    		}
    	};

    	const moveToPlace = e => {
    		$$invalidate(2, mockSelected = e.detail);
    	};

    	const writable_props = ['folderStruct', 'exclude'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MoveTo> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		dispatch("move-here", mockSelected);
    		dispatch("close-move", true);
    	};

    	const click_handler_1 = () => {
    		dispatch("close-move", true);
    	};

    	$$self.$$set = $$props => {
    		if ('folderStruct' in $$props) $$invalidate(0, folderStruct = $$props.folderStruct);
    		if ('exclude' in $$props) $$invalidate(1, exclude = $$props.exclude);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		BuildFolderStruct,
    		folderStruct,
    		exclude,
    		mockSelected,
    		closeMove,
    		moveToPlace
    	});

    	$$self.$inject_state = $$props => {
    		if ('folderStruct' in $$props) $$invalidate(0, folderStruct = $$props.folderStruct);
    		if ('exclude' in $$props) $$invalidate(1, exclude = $$props.exclude);
    		if ('mockSelected' in $$props) $$invalidate(2, mockSelected = $$props.mockSelected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		folderStruct,
    		exclude,
    		mockSelected,
    		dispatch,
    		closeMove,
    		moveToPlace,
    		click_handler,
    		click_handler_1
    	];
    }

    class MoveTo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { folderStruct: 0, exclude: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MoveTo",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*folderStruct*/ ctx[0] === undefined && !('folderStruct' in props)) {
    			console.warn("<MoveTo> was created without expected prop 'folderStruct'");
    		}

    		if (/*exclude*/ ctx[1] === undefined && !('exclude' in props)) {
    			console.warn("<MoveTo> was created without expected prop 'exclude'");
    		}
    	}

    	get folderStruct() {
    		throw new Error("<MoveTo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set folderStruct(value) {
    		throw new Error("<MoveTo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exclude() {
    		throw new Error("<MoveTo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exclude(value) {
    		throw new Error("<MoveTo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const getCookie$1 = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
    };

    /* src\components\Home.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file = "src\\components\\Home.svelte";

    // (207:0) {#if moveFolder}
    function create_if_block_3(ctx) {
    	let moveto;
    	let current;

    	moveto = new MoveTo({
    			props: {
    				folderStruct: /*folderStruct*/ ctx[5],
    				exclude: /*excludeFolder*/ ctx[11]
    			},
    			$$inline: true
    		});

    	moveto.$on("close-move", /*close_move_handler*/ ctx[19]);
    	moveto.$on("move-here", /*moveHere*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(moveto.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(moveto, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const moveto_changes = {};
    			if (dirty & /*folderStruct*/ 32) moveto_changes.folderStruct = /*folderStruct*/ ctx[5];
    			if (dirty & /*excludeFolder*/ 2048) moveto_changes.exclude = /*excludeFolder*/ ctx[11];
    			moveto.$set(moveto_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(moveto.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(moveto.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(moveto, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(207:0) {#if moveFolder}",
    		ctx
    	});

    	return block;
    }

    // (217:0) {#if boolPrompt}
    function create_if_block_2(ctx) {
    	let boolprompt;
    	let current;

    	boolprompt = new BoolPrompt({
    			props: {
    				extra: /*boolPrompt*/ ctx[10].extra,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	boolprompt.$on("boolChoose", function () {
    		if (is_function(/*boolPrompt*/ ctx[10].callback)) /*boolPrompt*/ ctx[10].callback.apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			create_component(boolprompt.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(boolprompt, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const boolprompt_changes = {};
    			if (dirty & /*boolPrompt*/ 1024) boolprompt_changes.extra = /*boolPrompt*/ ctx[10].extra;

    			if (dirty & /*$$scope, boolPrompt*/ 16778240) {
    				boolprompt_changes.$$scope = { dirty, ctx };
    			}

    			boolprompt.$set(boolprompt_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(boolprompt.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(boolprompt.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(boolprompt, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(217:0) {#if boolPrompt}",
    		ctx
    	});

    	return block;
    }

    // (218:2) <BoolPrompt extra={boolPrompt.extra} on:boolChoose={boolPrompt.callback}      >
    function create_default_slot_1$1(ctx) {
    	let t_value = /*boolPrompt*/ ctx[10].msg + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*boolPrompt*/ 1024 && t_value !== (t_value = /*boolPrompt*/ ctx[10].msg + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(218:2) <BoolPrompt extra={boolPrompt.extra} on:boolChoose={boolPrompt.callback}      >",
    		ctx
    	});

    	return block;
    }

    // (222:0) {#if showPrompt}
    function create_if_block_1(ctx) {
    	let prompt;
    	let current;

    	prompt = new Prompt({
    			props: {
    				promptPlaceholder: /*promptPlaceholder*/ ctx[8],
    				promptEvent: /*promptEvent*/ ctx[9],
    				promptExtra: /*promptExtra*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(prompt.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(prompt, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const prompt_changes = {};
    			if (dirty & /*promptPlaceholder*/ 256) prompt_changes.promptPlaceholder = /*promptPlaceholder*/ ctx[8];
    			if (dirty & /*promptEvent*/ 512) prompt_changes.promptEvent = /*promptEvent*/ ctx[9];
    			if (dirty & /*promptExtra*/ 128) prompt_changes.promptExtra = /*promptExtra*/ ctx[7];
    			prompt.$set(prompt_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prompt.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prompt.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(prompt, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(222:0) {#if showPrompt}",
    		ctx
    	});

    	return block;
    }

    // (225:0) {#if notification !== null}
    function create_if_block$1(ctx) {
    	let toastnotification;
    	let current;

    	toastnotification = new ToastNotification({
    			props: {
    				type: /*notification*/ ctx[4].status,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toastnotification.$on("close", /*close_handler*/ ctx[20]);

    	const block = {
    		c: function create() {
    			create_component(toastnotification.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toastnotification, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toastnotification_changes = {};
    			if (dirty & /*notification*/ 16) toastnotification_changes.type = /*notification*/ ctx[4].status;

    			if (dirty & /*$$scope, notification*/ 16777232) {
    				toastnotification_changes.$$scope = { dirty, ctx };
    			}

    			toastnotification.$set(toastnotification_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toastnotification.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toastnotification.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toastnotification, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(225:0) {#if notification !== null}",
    		ctx
    	});

    	return block;
    }

    // (226:2) <ToastNotification      type={notification.status}      on:close={() => {        notification = null;      }}>
    function create_default_slot$1(ctx) {
    	let t_value = /*notification*/ ctx[4].msg + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notification*/ 16 && t_value !== (t_value = /*notification*/ ctx[4].msg + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(226:2) <ToastNotification      type={notification.status}      on:close={() => {        notification = null;      }}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let main;
    	let sidefolder;
    	let t4;
    	let folderpart;
    	let t5;
    	let section;
    	let locationpath;
    	let t6;
    	let filestruct;
    	let current;
    	let if_block0 = /*moveFolder*/ ctx[12] && create_if_block_3(ctx);
    	let if_block1 = /*boolPrompt*/ ctx[10] && create_if_block_2(ctx);
    	let if_block2 = /*showPrompt*/ ctx[6] && create_if_block_1(ctx);
    	let if_block3 = /*notification*/ ctx[4] !== null && create_if_block$1(ctx);
    	sidefolder = new SideFolder({ $$inline: true });

    	folderpart = new FolderPart({
    			props: {
    				userData: /*userData*/ ctx[0],
    				folderStruct: /*folderStruct*/ ctx[5],
    				selected: /*selected*/ ctx[2]
    			},
    			$$inline: true
    		});

    	folderpart.$on("folderClicked", /*newLoc*/ ctx[13]);
    	folderpart.$on("rename-folder", /*renameFolderPrompt*/ ctx[15]);
    	folderpart.$on("new-folder", /*newFolderPrompt*/ ctx[16]);
    	folderpart.$on("move-folder", /*moveFolderPrompt*/ ctx[18]);
    	folderpart.$on("delete-folder", /*deleteFolderPrompt*/ ctx[17]);

    	locationpath = new LocationPath({
    			props: { selected: /*selected*/ ctx[2] },
    			$$inline: true
    		});

    	locationpath.$on("change-dir", /*newLoc*/ ctx[13]);

    	filestruct = new FileStruct({
    			props: {
    				selected: /*selected*/ ctx[2],
    				files: /*currentFolderPathFiles*/ ctx[3],
    				PROXY: /*PROXY*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			main = element("main");
    			create_component(sidefolder.$$.fragment);
    			t4 = space();
    			create_component(folderpart.$$.fragment);
    			t5 = space();
    			section = element("section");
    			create_component(locationpath.$$.fragment);
    			t6 = space();
    			create_component(filestruct.$$.fragment);
    			attr_dev(section, "class", "file-part svelte-cjs30e");
    			add_location(section, file, 244, 2, 6380);
    			attr_dev(main, "class", "svelte-cjs30e");
    			add_location(main, file, 232, 0, 6086);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(sidefolder, main, null);
    			append_dev(main, t4);
    			mount_component(folderpart, main, null);
    			append_dev(main, t5);
    			append_dev(main, section);
    			mount_component(locationpath, section, null);
    			append_dev(section, t6);
    			mount_component(filestruct, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*moveFolder*/ ctx[12]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*moveFolder*/ 4096) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*boolPrompt*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*boolPrompt*/ 1024) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*showPrompt*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*showPrompt*/ 64) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*notification*/ ctx[4] !== null) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*notification*/ 16) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			const folderpart_changes = {};
    			if (dirty & /*userData*/ 1) folderpart_changes.userData = /*userData*/ ctx[0];
    			if (dirty & /*folderStruct*/ 32) folderpart_changes.folderStruct = /*folderStruct*/ ctx[5];
    			if (dirty & /*selected*/ 4) folderpart_changes.selected = /*selected*/ ctx[2];
    			folderpart.$set(folderpart_changes);
    			const locationpath_changes = {};
    			if (dirty & /*selected*/ 4) locationpath_changes.selected = /*selected*/ ctx[2];
    			locationpath.$set(locationpath_changes);
    			const filestruct_changes = {};
    			if (dirty & /*selected*/ 4) filestruct_changes.selected = /*selected*/ ctx[2];
    			if (dirty & /*currentFolderPathFiles*/ 8) filestruct_changes.files = /*currentFolderPathFiles*/ ctx[3];
    			if (dirty & /*PROXY*/ 2) filestruct_changes.PROXY = /*PROXY*/ ctx[1];
    			filestruct.$set(filestruct_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(sidefolder.$$.fragment, local);
    			transition_in(folderpart.$$.fragment, local);
    			transition_in(locationpath.$$.fragment, local);
    			transition_in(filestruct.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(sidefolder.$$.fragment, local);
    			transition_out(folderpart.$$.fragment, local);
    			transition_out(locationpath.$$.fragment, local);
    			transition_out(filestruct.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(main);
    			destroy_component(sidefolder);
    			destroy_component(folderpart);
    			destroy_component(locationpath);
    			destroy_component(filestruct);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let { userData } = $$props;
    	let { PROXY } = $$props;
    	let selected = "none";
    	let currentFolderPathFiles = "";
    	let notification = null;
    	let folderStruct = {};
    	let showPrompt = false;
    	let promptExtra = "jeff";
    	let promptPlaceholder;
    	let promptEvent;
    	let boolPrompt = false;
    	let excludeFolder = null;
    	let moveFolder = false;

    	fetch(`${PROXY}fetchFiles?cred=${getCookie$1("G_VAR2")}`).then(response => response.json()).then(data => {
    		console.log(data);
    		$$invalidate(5, folderStruct = data.files);
    		newLoc({ detail: null });
    	});

    	const newLoc = ({ detail }) => {
    		if (detail === null) {
    			$$invalidate(2, selected = false);

    			$$invalidate(3, currentFolderPathFiles = !folderStruct["G_files"].length === 0
    			? []
    			: folderStruct.G_files);
    		} else {
    			$$invalidate(2, selected = detail);
    			detail = detail.split("/");
    			let files = folderStruct[detail[0]];

    			for (let i = 1; i < detail.length; i++) {
    				files = files[detail[i]];
    			}

    			if (!files["G_files"]) {
    				$$invalidate(3, currentFolderPathFiles = []);
    				return;
    			}

    			$$invalidate(3, currentFolderPathFiles = !files["G_files"].length === 0 ? [] : files.G_files);
    		}
    	};

    	const newFolder = (e, extra) => {
    		if (!e) {
    			$$invalidate(6, showPrompt = false);
    			return;
    		}

    		$$invalidate(6, showPrompt = false);

    		fetch(`${PROXY}addFolder?cred=${getCookie$1("G_VAR2")}&location=${extra ? extra : " "}&name=${e.target[0].value}`, { method: "POST" }).then(response => response.json()).then(data => {
    			if (data.msg === "Good") {
    				$$invalidate(5, folderStruct = data.files);

    				$$invalidate(4, notification = {
    					status: "success",
    					msg: `Created folder '${e.target[0].value}'`
    				});
    			} else {
    				$$invalidate(4, notification = { status: "alert", msg: data.msg });
    			}
    		});
    	};

    	const renameFolder = (e, extra) => {
    		if (!e) {
    			$$invalidate(6, showPrompt = false);
    			return;
    		}

    		$$invalidate(6, showPrompt = false);

    		fetch(`${PROXY}renameFolder?cred=${getCookie$1("G_VAR2")}&location=${extra ? extra : " "}&name=${e.target[0].value}`, { method: "POST" }).then(response => response.json()).then(data => {
    			if (data.msg === "Good") {
    				$$invalidate(5, folderStruct = data.files);

    				$$invalidate(4, notification = {
    					status: "success",
    					msg: `Renamed folder to '${e.target[0].value}'`
    				});

    				newLoc({
    					detail: selected.split("/").slice(0, -1).join("/") + e.target[0].value
    				});
    			} else {
    				$$invalidate(4, notification = { status: "alert", msg: data.msg });
    			}
    		});
    	};

    	const deleteFolder = ({ detail }) => {
    		$$invalidate(10, boolPrompt = false);

    		if (!detail.choose) {
    			return;
    		}

    		fetch(`${PROXY}deleteFolder?cred=${getCookie$1("G_VAR2")}&location=${detail.extra}`, { method: "POST" }).then(response => response.json()).then(data => {
    			if (data.msg === "Good") {
    				$$invalidate(5, folderStruct = data.files);

    				$$invalidate(4, notification = {
    					status: "success",
    					msg: `Deleted folder: '${detail.extra.split("/").reverse()[0]}'`
    				});

    				newLoc({
    					detail: selected.split("/").slice(0, -1).join("/") === ""
    					? null
    					: selected.split("/").slice(0, -1).join("/")
    				});
    			} else {
    				$$invalidate(4, notification = { status: "alert", msg: data.msg });
    			}
    		});
    	};

    	const moveHere = ({ detail }) => {
    		console.log(detail, selected);

    		fetch(`${PROXY}moveFolder?cred=${getCookie$1("G_VAR2")}&location=${selected}&dest=${detail}`, { method: "POST" }).then(response => response.json()).then(data => {
    			if (data.msg === "Good") {
    				$$invalidate(5, folderStruct = data.files);
    				$$invalidate(4, notification = { status: "success", msg: `Moved folder!` });
    				newLoc({ detail });
    			} else {
    				$$invalidate(4, notification = { status: "alert", msg: data.msg });
    			}
    		});
    	};

    	const renameFolderPrompt = ({ detail }) => {
    		$$invalidate(7, promptExtra = detail);
    		$$invalidate(9, promptEvent = renameFolder);
    		$$invalidate(8, promptPlaceholder = "Rename Folder to");
    		$$invalidate(6, showPrompt = true);
    	};

    	const newFolderPrompt = ({ detail }) => {
    		$$invalidate(7, promptExtra = detail.selected);
    		$$invalidate(9, promptEvent = newFolder);
    		$$invalidate(8, promptPlaceholder = "Folder Name");
    		$$invalidate(6, showPrompt = true);
    	};

    	const deleteFolderPrompt = ({ detail }) => {
    		$$invalidate(10, boolPrompt = {
    			msg: "Delete Folder?",
    			extra: detail,
    			callback: deleteFolder
    		});
    	};

    	const moveFolderPrompt = ({ detail }) => {
    		$$invalidate(12, moveFolder = true);
    		$$invalidate(11, excludeFolder = detail);
    	};

    	const writable_props = ['userData', 'PROXY'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	const close_move_handler = () => {
    		$$invalidate(12, moveFolder = false);
    	};

    	const close_handler = () => {
    		$$invalidate(4, notification = null);
    	};

    	$$self.$$set = $$props => {
    		if ('userData' in $$props) $$invalidate(0, userData = $$props.userData);
    		if ('PROXY' in $$props) $$invalidate(1, PROXY = $$props.PROXY);
    	};

    	$$self.$capture_state = () => ({
    		ToastNotification,
    		FileStruct,
    		SideFolder,
    		FolderPart,
    		LocationPath,
    		Prompt,
    		BoolPrompt,
    		MoveTo,
    		getCookie: getCookie$1,
    		userData,
    		PROXY,
    		selected,
    		currentFolderPathFiles,
    		notification,
    		folderStruct,
    		showPrompt,
    		promptExtra,
    		promptPlaceholder,
    		promptEvent,
    		boolPrompt,
    		excludeFolder,
    		moveFolder,
    		newLoc,
    		newFolder,
    		renameFolder,
    		deleteFolder,
    		moveHere,
    		renameFolderPrompt,
    		newFolderPrompt,
    		deleteFolderPrompt,
    		moveFolderPrompt
    	});

    	$$self.$inject_state = $$props => {
    		if ('userData' in $$props) $$invalidate(0, userData = $$props.userData);
    		if ('PROXY' in $$props) $$invalidate(1, PROXY = $$props.PROXY);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('currentFolderPathFiles' in $$props) $$invalidate(3, currentFolderPathFiles = $$props.currentFolderPathFiles);
    		if ('notification' in $$props) $$invalidate(4, notification = $$props.notification);
    		if ('folderStruct' in $$props) $$invalidate(5, folderStruct = $$props.folderStruct);
    		if ('showPrompt' in $$props) $$invalidate(6, showPrompt = $$props.showPrompt);
    		if ('promptExtra' in $$props) $$invalidate(7, promptExtra = $$props.promptExtra);
    		if ('promptPlaceholder' in $$props) $$invalidate(8, promptPlaceholder = $$props.promptPlaceholder);
    		if ('promptEvent' in $$props) $$invalidate(9, promptEvent = $$props.promptEvent);
    		if ('boolPrompt' in $$props) $$invalidate(10, boolPrompt = $$props.boolPrompt);
    		if ('excludeFolder' in $$props) $$invalidate(11, excludeFolder = $$props.excludeFolder);
    		if ('moveFolder' in $$props) $$invalidate(12, moveFolder = $$props.moveFolder);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selected*/ 4) ;
    	};

    	return [
    		userData,
    		PROXY,
    		selected,
    		currentFolderPathFiles,
    		notification,
    		folderStruct,
    		showPrompt,
    		promptExtra,
    		promptPlaceholder,
    		promptEvent,
    		boolPrompt,
    		excludeFolder,
    		moveFolder,
    		newLoc,
    		moveHere,
    		renameFolderPrompt,
    		newFolderPrompt,
    		deleteFolderPrompt,
    		moveFolderPrompt,
    		close_move_handler,
    		close_handler
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { userData: 0, PROXY: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*userData*/ ctx[0] === undefined && !('userData' in props)) {
    			console_1.warn("<Home> was created without expected prop 'userData'");
    		}

    		if (/*PROXY*/ ctx[1] === undefined && !('PROXY' in props)) {
    			console_1.warn("<Home> was created without expected prop 'PROXY'");
    		}
    	}

    	get userData() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userData(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get PROXY() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set PROXY(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CheckLog.svelte generated by Svelte v3.48.0 */

    // (40:0) {:else}
    function create_else_block(ctx) {
    	let notlogged;
    	let current;

    	notlogged = new NotLogged({
    			props: { PROXY: /*PROXY*/ ctx[0] },
    			$$inline: true
    		});

    	notlogged.$on("userLoggedIn", /*loggedIn*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(notlogged.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notlogged, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notlogged_changes = {};
    			if (dirty & /*PROXY*/ 1) notlogged_changes.PROXY = /*PROXY*/ ctx[0];
    			notlogged.$set(notlogged_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notlogged.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notlogged.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notlogged, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(40:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:0) {#if isLogged}
    function create_if_block(ctx) {
    	let home;
    	let current;

    	home = new Home({
    			props: {
    				userData: /*userData*/ ctx[2],
    				PROXY: /*PROXY*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const home_changes = {};
    			if (dirty & /*userData*/ 4) home_changes.userData = /*userData*/ ctx[2];
    			if (dirty & /*PROXY*/ 1) home_changes.PROXY = /*PROXY*/ ctx[0];
    			home.$set(home_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(38:0) {#if isLogged}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isLogged*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getCookie(name) {
    	const value = `; ${document.cookie}`;
    	const parts = value.split(`; ${name}=`);
    	if (parts.length === 2) return parts.pop().split(";").shift();
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CheckLog', slots, []);
    	let { PROXY } = $$props;
    	let isLogged = false;
    	let userData;
    	const cookie = getCookie("G_VAR2");

    	if (cookie === undefined || cookie === null) {
    		// navigate("/");
    		isLogged = false;
    	} else {
    		fetch(`${PROXY}userData?cred=${getCookie("G_VAR2")}`).then(response => response.json()).then(data => {
    			if (data.status !== 200) {
    				$$invalidate(1, isLogged = false);
    			} else {
    				loggedIn({ detail: data.userData });
    			}
    		});
    	}

    	const loggedIn = e => {
    		$$invalidate(2, userData = e.detail);
    		$$invalidate(1, isLogged = true);
    	};

    	const writable_props = ['PROXY'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CheckLog> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('PROXY' in $$props) $$invalidate(0, PROXY = $$props.PROXY);
    	};

    	$$self.$capture_state = () => ({
    		useNavigate,
    		NotLogged,
    		Home,
    		PROXY,
    		isLogged,
    		userData,
    		getCookie,
    		cookie,
    		loggedIn
    	});

    	$$self.$inject_state = $$props => {
    		if ('PROXY' in $$props) $$invalidate(0, PROXY = $$props.PROXY);
    		if ('isLogged' in $$props) $$invalidate(1, isLogged = $$props.isLogged);
    		if ('userData' in $$props) $$invalidate(2, userData = $$props.userData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [PROXY, isLogged, userData, loggedIn];
    }

    class CheckLog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { PROXY: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CheckLog",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*PROXY*/ ctx[0] === undefined && !('PROXY' in props)) {
    			console.warn("<CheckLog> was created without expected prop 'PROXY'");
    		}
    	}

    	get PROXY() {
    		throw new Error("<CheckLog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set PROXY(value) {
    		throw new Error("<CheckLog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Logout.svelte generated by Svelte v3.48.0 */

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Logout', slots, []);

    	const get_cookie = name => {
    		return document.cookie.split(";").some(c => {
    			return c.trim().startsWith(name + "=");
    		});
    	};

    	const delete_cookie = (name, path) => {
    		if (get_cookie(name)) {
    			document.cookie = name + "=" + (path ? ";path=" + path : "") + ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    		}
    	};

    	delete_cookie("G_VAR2", "/");
    	const navigate = useNavigate();
    	navigate("/");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Logout> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		get_cookie,
    		delete_cookie,
    		useNavigate,
    		navigate
    	});

    	return [];
    }

    class Logout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logout",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */

    // (12:2) <Route path="/home" primary={false}>
    function create_default_slot_3(ctx) {
    	let notlogged;
    	let current;
    	notlogged = new NotLogged({ props: { PROXY }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(notlogged.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notlogged, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notlogged.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notlogged.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notlogged, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(12:2) <Route path=\\\"/home\\\" primary={false}>",
    		ctx
    	});

    	return block;
    }

    // (16:2) <Route path="/" primary={false}>
    function create_default_slot_2(ctx) {
    	let checklog;
    	let current;
    	checklog = new CheckLog({ props: { PROXY }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(checklog.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(checklog, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checklog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checklog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(checklog, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(16:2) <Route path=\\\"/\\\" primary={false}>",
    		ctx
    	});

    	return block;
    }

    // (20:2) <Route path="/logout" primary={false}>
    function create_default_slot_1(ctx) {
    	let logout;
    	let current;
    	logout = new Logout({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(logout.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(logout, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(logout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(20:2) <Route path=\\\"/logout\\\" primary={false}>",
    		ctx
    	});

    	return block;
    }

    // (11:0) <Router>
    function create_default_slot(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let current;

    	route0 = new Route$1({
    			props: {
    				path: "/home",
    				primary: false,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route$1({
    			props: {
    				path: "/",
    				primary: false,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route$1({
    			props: {
    				path: "/logout",
    				primary: false,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(11:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router$1({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const PROXY = "http://192.168.0.24:5700/";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router: Router$1,
    		Route: Route$1,
    		CheckLog,
    		NotLogged,
    		Logout,
    		PROXY
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
