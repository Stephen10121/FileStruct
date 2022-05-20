
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
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

    /* src\components\FolderButton.svelte generated by Svelte v3.48.0 */
    const file$6 = "src\\components\\FolderButton.svelte";

    function create_fragment$8(ctx) {
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
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

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
    			add_location(img0, file$6, 14, 4, 341);
    			attr_dev(button0, "class", "tributton svelte-1i2b9wc");
    			add_location(button0, file$6, 13, 2, 309);
    			if (!src_url_equal(img1.src, img1_src_value = "folder.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Folder Img");
    			attr_dev(img1, "class", "svelte-1i2b9wc");
    			add_location(img1, file$6, 20, 4, 519);
    			attr_dev(p, "class", "svelte-1i2b9wc");
    			add_location(p, file$6, 20, 45, 560);

    			attr_dev(button1, "class", button1_class_value = "selectButton " + (/*selected*/ ctx[2] === /*location*/ ctx[0]
    			? 'buttonSelected'
    			: null) + " svelte-1i2b9wc");

    			add_location(button1, file$6, 16, 2, 397);
    			attr_dev(li, "id", li_id_value = /*location*/ ctx[0] + /*folderName*/ ctx[1]);
    			attr_dev(li, "class", "svelte-1i2b9wc");
    			add_location(li, file$6, 12, 0, 274);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    				dispose = listen_dev(button1, "click", /*clickFolder*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FolderButton', slots, ['default']);
    	let { location } = $$props;
    	let { folderName } = $$props;
    	let { selected } = $$props;
    	const dispatch = createEventDispatcher();

    	const clickFolder = () => {
    		dispatch("folderClicked", location);
    	};

    	const writable_props = ['location', 'folderName', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FolderButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('location' in $$props) $$invalidate(0, location = $$props.location);
    		if ('folderName' in $$props) $$invalidate(1, folderName = $$props.folderName);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		location,
    		folderName,
    		selected,
    		dispatch,
    		clickFolder
    	});

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate(0, location = $$props.location);
    		if ('folderName' in $$props) $$invalidate(1, folderName = $$props.folderName);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [location, folderName, selected, clickFolder, $$scope, slots];
    }

    class FolderButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { location: 0, folderName: 1, selected: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FolderButton",
    			options,
    			id: create_fragment$8.name
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
    }

    /* src\components\FolderWSButton.svelte generated by Svelte v3.48.0 */
    const file$5 = "src\\components\\FolderWSButton.svelte";
    const get_subfolders_slot_changes = dirty => ({});
    const get_subfolders_slot_context = ctx => ({ class: "subfolderspan" });
    const get_folderName_slot_changes = dirty => ({});
    const get_folderName_slot_context = ctx => ({});

    // (30:0) {#if showSub}
    function create_if_block$5(ctx) {
    	let ul;
    	let current;
    	const subfolders_slot_template = /*#slots*/ ctx[6].subfolders;
    	const subfolders_slot = create_slot(subfolders_slot_template, ctx, /*$$scope*/ ctx[5], get_subfolders_slot_context);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (subfolders_slot) subfolders_slot.c();
    			attr_dev(ul, "class", "subfolder svelte-qzm1jo");
    			add_location(ul, file$5, 30, 2, 757);
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
    				if (subfolders_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						subfolders_slot,
    						subfolders_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(subfolders_slot_template, /*$$scope*/ ctx[5], dirty, get_subfolders_slot_changes),
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
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(30:0) {#if showSub}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
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
    	const folderName_slot_template = /*#slots*/ ctx[6].folderName;
    	const folderName_slot = create_slot(folderName_slot_template, ctx, /*$$scope*/ ctx[5], get_folderName_slot_context);
    	let if_block = /*showSub*/ ctx[3] && create_if_block$5(ctx);

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
    			if_block_anchor = empty();
    			if (!src_url_equal(img0.src, img0_src_value = "icons/triangle.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-qzm1jo");
    			add_location(img0, file$5, 20, 4, 466);
    			attr_dev(button0, "class", button0_class_value = "tributton " + (/*showSub*/ ctx[3] ? 'rotateButton' : null) + " svelte-qzm1jo");
    			add_location(button0, file$5, 14, 3, 333);
    			if (!src_url_equal(img1.src, img1_src_value = "folder.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Folder Img");
    			attr_dev(img1, "class", "svelte-qzm1jo");
    			add_location(img1, file$5, 26, 4, 644);
    			attr_dev(p, "class", "svelte-qzm1jo");
    			add_location(p, file$5, 26, 45, 685);

    			attr_dev(button1, "class", button1_class_value = "selectButton " + (/*selected*/ ctx[2] === /*location*/ ctx[0]
    			? 'buttonSelected'
    			: null) + " svelte-qzm1jo");

    			add_location(button1, file$5, 22, 2, 522);
    			attr_dev(li, "id", li_id_value = /*location*/ ctx[0] + /*folderName*/ ctx[1]);
    			attr_dev(li, "class", "svelte-qzm1jo");
    			add_location(li, file$5, 13, 0, 298);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    					listen_dev(button0, "click", /*click_handler*/ ctx[7], false, false, false),
    					listen_dev(button1, "click", /*clickFolder*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*showSub*/ 8 && button0_class_value !== (button0_class_value = "tributton " + (/*showSub*/ ctx[3] ? 'rotateButton' : null) + " svelte-qzm1jo")) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (folderName_slot) {
    				if (folderName_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						folderName_slot,
    						folderName_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(folderName_slot_template, /*$$scope*/ ctx[5], dirty, get_folderName_slot_changes),
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

    			if (/*showSub*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showSub*/ 8) {
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FolderWSButton', slots, ['folderName','subfolders']);
    	let { location } = $$props;
    	let { folderName } = $$props;
    	let { selected } = $$props;
    	let showSub = false;
    	const dispatch = createEventDispatcher();

    	const clickFolder = () => {
    		dispatch("folderClicked", location);
    	};

    	const writable_props = ['location', 'folderName', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FolderWSButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(3, showSub = !showSub);
    	};

    	$$self.$$set = $$props => {
    		if ('location' in $$props) $$invalidate(0, location = $$props.location);
    		if ('folderName' in $$props) $$invalidate(1, folderName = $$props.folderName);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		location,
    		folderName,
    		selected,
    		showSub,
    		dispatch,
    		clickFolder
    	});

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate(0, location = $$props.location);
    		if ('folderName' in $$props) $$invalidate(1, folderName = $$props.folderName);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('showSub' in $$props) $$invalidate(3, showSub = $$props.showSub);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		location,
    		folderName,
    		selected,
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { location: 0, folderName: 1, selected: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FolderWSButton",
    			options,
    			id: create_fragment$7.name
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
    }

    /* src\components\FolderFilter.svelte generated by Svelte v3.48.0 */

    const { Object: Object_1$1 } = globals;
    const file$4 = "src\\components\\FolderFilter.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (11:2) {#if startFolder !== "G_files"}
    function create_if_block$4(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*currentFolder*/ 1) show_if = null;
    		if (show_if == null) show_if = !!(Object.keys(/*currentFolder*/ ctx[0][/*startFolder*/ ctx[7]]).length === 0 | (Object.keys(/*currentFolder*/ ctx[0][/*startFolder*/ ctx[7]]).length === 1 && Object.keys(/*currentFolder*/ ctx[0][/*startFolder*/ ctx[7]])[0] === "G_files"));
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
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
    		source: "(11:2) {#if startFolder !== \\\"G_files\\\"}",
    		ctx
    	});

    	return block;
    }

    // (19:4) {:else}
    function create_else_block$2(ctx) {
    	let folderwsbutton;
    	let current;

    	folderwsbutton = new FolderWSButton({
    			props: {
    				selected: /*selected*/ ctx[3],
    				folderName: /*startFolder*/ ctx[7],
    				location: /*path*/ ctx[2] + "/" + /*startFolder*/ ctx[7],
    				$$slots: {
    					subfolders: [create_subfolders_slot$1],
    					folderName: [create_folderName_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	folderwsbutton.$on("folderClicked", /*folderClicked_handler_1*/ ctx[6]);

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
    			if (dirty & /*currentFolder*/ 1) folderwsbutton_changes.folderName = /*startFolder*/ ctx[7];
    			if (dirty & /*path, currentFolder*/ 5) folderwsbutton_changes.location = /*path*/ ctx[2] + "/" + /*startFolder*/ ctx[7];

    			if (dirty & /*$$scope, RecursiveFolders, selected, currentFolder, path*/ 1039) {
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
    		source: "(19:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (12:4) {#if (Object.keys(currentFolder[startFolder]).length === 0) | (Object.keys(currentFolder[startFolder]).length === 1 && Object.keys(currentFolder[startFolder])[0] === "G_files")}
    function create_if_block_1$1(ctx) {
    	let folderbutton;
    	let current;

    	folderbutton = new FolderButton({
    			props: {
    				selected: /*selected*/ ctx[3],
    				folderName: /*startFolder*/ ctx[7],
    				location: /*path*/ ctx[2] + "/" + /*startFolder*/ ctx[7],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	folderbutton.$on("folderClicked", /*folderClicked_handler*/ ctx[4]);

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
    			if (dirty & /*currentFolder*/ 1) folderbutton_changes.folderName = /*startFolder*/ ctx[7];
    			if (dirty & /*path, currentFolder*/ 5) folderbutton_changes.location = /*path*/ ctx[2] + "/" + /*startFolder*/ ctx[7];

    			if (dirty & /*$$scope, currentFolder*/ 1025) {
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
    		source: "(12:4) {#if (Object.keys(currentFolder[startFolder]).length === 0) | (Object.keys(currentFolder[startFolder]).length === 1 && Object.keys(currentFolder[startFolder])[0] === \\\"G_files\\\")}",
    		ctx
    	});

    	return block;
    }

    // (26:8) 
    function create_folderName_slot$1(ctx) {
    	let span;
    	let t_value = /*startFolder*/ ctx[7] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "slot", "folderName");
    			add_location(span, file$4, 25, 8, 882);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentFolder*/ 1 && t_value !== (t_value = /*startFolder*/ ctx[7] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_folderName_slot$1.name,
    		type: "slot",
    		source: "(26:8) ",
    		ctx
    	});

    	return block;
    }

    // (27:8) 
    function create_subfolders_slot$1(ctx) {
    	let span;
    	let switch_instance;
    	let current;
    	var switch_value = /*RecursiveFolders*/ ctx[1];

    	function switch_props(ctx) {
    		return {
    			props: {
    				selected: /*selected*/ ctx[3],
    				currentFolder: /*currentFolder*/ ctx[0][/*startFolder*/ ctx[7]],
    				path: /*path*/ ctx[2] + "/" + /*startFolder*/ ctx[7],
    				RecursiveFolders: /*RecursiveFolders*/ ctx[1]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("folderClicked", /*folderClicked_handler_2*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(span, "slot", "subfolders");
    			add_location(span, file$4, 26, 8, 936);
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
    			if (dirty & /*currentFolder*/ 1) switch_instance_changes.currentFolder = /*currentFolder*/ ctx[0][/*startFolder*/ ctx[7]];
    			if (dirty & /*path, currentFolder*/ 5) switch_instance_changes.path = /*path*/ ctx[2] + "/" + /*startFolder*/ ctx[7];
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
    					switch_instance.$on("folderClicked", /*folderClicked_handler_2*/ ctx[5]);
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
    		source: "(27:8) ",
    		ctx
    	});

    	return block;
    }

    // (13:6) <FolderButton          {selected}          folderName={startFolder}          location={path + "/" + startFolder}          on:folderClicked>
    function create_default_slot$3(ctx) {
    	let t_value = /*startFolder*/ ctx[7] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentFolder*/ 1 && t_value !== (t_value = /*startFolder*/ ctx[7] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(13:6) <FolderButton          {selected}          folderName={startFolder}          location={path + \\\"/\\\" + startFolder}          on:folderClicked>",
    		ctx
    	});

    	return block;
    }

    // (10:0) {#each Object.keys(currentFolder) as startFolder (startFolder)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*startFolder*/ ctx[7] !== "G_files" && create_if_block$4(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
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

    			if (/*startFolder*/ ctx[7] !== "G_files") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*currentFolder*/ 1) {
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(10:0) {#each Object.keys(currentFolder) as startFolder (startFolder)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = Object.keys(/*currentFolder*/ ctx[0]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*startFolder*/ ctx[7];
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

    			each_1_anchor = empty();
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
    			if (dirty & /*selected, Object, currentFolder, path, RecursiveFolders*/ 15) {
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FolderFilter', slots, []);
    	let { currentFolder } = $$props;
    	let { RecursiveFolders } = $$props;
    	let { path } = $$props;
    	let { selected } = $$props;
    	const writable_props = ['currentFolder', 'RecursiveFolders', 'path', 'selected'];

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
    	};

    	$$self.$capture_state = () => ({
    		FolderButton,
    		FolderWSButton,
    		currentFolder,
    		RecursiveFolders,
    		path,
    		selected
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentFolder' in $$props) $$invalidate(0, currentFolder = $$props.currentFolder);
    		if ('RecursiveFolders' in $$props) $$invalidate(1, RecursiveFolders = $$props.RecursiveFolders);
    		if ('path' in $$props) $$invalidate(2, path = $$props.path);
    		if ('selected' in $$props) $$invalidate(3, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		currentFolder,
    		RecursiveFolders,
    		path,
    		selected,
    		folderClicked_handler,
    		folderClicked_handler_2,
    		folderClicked_handler_1
    	];
    }

    class FolderFilter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			currentFolder: 0,
    			RecursiveFolders: 1,
    			path: 2,
    			selected: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FolderFilter",
    			options,
    			id: create_fragment$6.name
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
    }

    /* src\components\BuildFolderStruct.svelte generated by Svelte v3.48.0 */

    const { Object: Object_1 } = globals;
    const file$3 = "src\\components\\BuildFolderStruct.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (19:4) {#if startFolder !== "G_files"}
    function create_if_block$3(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*folders*/ 1) show_if = null;
    		if (show_if == null) show_if = !!(Object.keys(/*folders*/ ctx[0][/*startFolder*/ ctx[7]]).length === 0 | (Object.keys(/*folders*/ ctx[0][/*startFolder*/ ctx[7]]).length === 1 && Object.keys(/*folders*/ ctx[0][/*startFolder*/ ctx[7]])[0] === "G_files"));
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(19:4) {#if startFolder !== \\\"G_files\\\"}",
    		ctx
    	});

    	return block;
    }

    // (33:6) {:else}
    function create_else_block$1(ctx) {
    	let folderwsbutton;
    	let current;

    	folderwsbutton = new FolderWSButton({
    			props: {
    				selected: /*selected*/ ctx[1],
    				folderName: /*startFolder*/ ctx[7],
    				location: /*startFolder*/ ctx[7],
    				$$slots: {
    					subfolders: [create_subfolders_slot],
    					folderName: [create_folderName_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	folderwsbutton.$on("folderClicked", /*folderClicked_handler_2*/ ctx[6]);

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
    			if (dirty & /*selected*/ 2) folderwsbutton_changes.selected = /*selected*/ ctx[1];
    			if (dirty & /*folders*/ 1) folderwsbutton_changes.folderName = /*startFolder*/ ctx[7];
    			if (dirty & /*folders*/ 1) folderwsbutton_changes.location = /*startFolder*/ ctx[7];

    			if (dirty & /*$$scope, selected, folders*/ 1027) {
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(33:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:6) {#if (Object.keys(folders[startFolder]).length === 0) | (Object.keys(folders[startFolder]).length === 1 && Object.keys(folders[startFolder])[0] === "G_files")}
    function create_if_block_1(ctx) {
    	let folderbutton;
    	let current;

    	folderbutton = new FolderButton({
    			props: {
    				selected: /*selected*/ ctx[1],
    				folderName: /*startFolder*/ ctx[7],
    				location: /*startFolder*/ ctx[7],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	folderbutton.$on("folderClicked", /*folderClicked_handler_1*/ ctx[4]);

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
    			if (dirty & /*selected*/ 2) folderbutton_changes.selected = /*selected*/ ctx[1];
    			if (dirty & /*folders*/ 1) folderbutton_changes.folderName = /*startFolder*/ ctx[7];
    			if (dirty & /*folders*/ 1) folderbutton_changes.location = /*startFolder*/ ctx[7];

    			if (dirty & /*$$scope, folders*/ 1025) {
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(20:6) {#if (Object.keys(folders[startFolder]).length === 0) | (Object.keys(folders[startFolder]).length === 1 && Object.keys(folders[startFolder])[0] === \\\"G_files\\\")}",
    		ctx
    	});

    	return block;
    }

    // (46:10) 
    function create_folderName_slot(ctx) {
    	let span;
    	let t_value = /*startFolder*/ ctx[7] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "slot", "folderName");
    			add_location(span, file$3, 45, 10, 1466);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*folders*/ 1 && t_value !== (t_value = /*startFolder*/ ctx[7] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_folderName_slot.name,
    		type: "slot",
    		source: "(46:10) ",
    		ctx
    	});

    	return block;
    }

    // (47:10) 
    function create_subfolders_slot(ctx) {
    	let span;
    	let folderfilter;
    	let current;

    	folderfilter = new FolderFilter({
    			props: {
    				selected: /*selected*/ ctx[1],
    				path: /*startFolder*/ ctx[7],
    				currentFolder: /*folders*/ ctx[0][/*startFolder*/ ctx[7]],
    				RecursiveFolders: FolderFilter
    			},
    			$$inline: true
    		});

    	folderfilter.$on("folderClicked", /*folderClicked_handler*/ ctx[5]);

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(folderfilter.$$.fragment);
    			attr_dev(span, "slot", "subfolders");
    			add_location(span, file$3, 46, 10, 1522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(folderfilter, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const folderfilter_changes = {};
    			if (dirty & /*selected*/ 2) folderfilter_changes.selected = /*selected*/ ctx[1];
    			if (dirty & /*folders*/ 1) folderfilter_changes.path = /*startFolder*/ ctx[7];
    			if (dirty & /*folders*/ 1) folderfilter_changes.currentFolder = /*folders*/ ctx[0][/*startFolder*/ ctx[7]];
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
    		source: "(47:10) ",
    		ctx
    	});

    	return block;
    }

    // (21:8) <FolderButton            {selected}            folderName={startFolder}            location={startFolder}            on:folderClicked={(e) => {              if (currentFolder === e.detail) {                dispatch("folderClicked", currentFolder);              } else {                currentFolder = e.detail;              }            }}>
    function create_default_slot$2(ctx) {
    	let t_value = /*startFolder*/ ctx[7] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*folders*/ 1 && t_value !== (t_value = /*startFolder*/ ctx[7] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(21:8) <FolderButton            {selected}            folderName={startFolder}            location={startFolder}            on:folderClicked={(e) => {              if (currentFolder === e.detail) {                dispatch(\\\"folderClicked\\\", currentFolder);              } else {                currentFolder = e.detail;              }            }}>",
    		ctx
    	});

    	return block;
    }

    // (18:2) {#each Object.keys(folders) as startFolder (startFolder)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*startFolder*/ ctx[7] !== "G_files" && create_if_block$3(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
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

    			if (/*startFolder*/ ctx[7] !== "G_files") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*folders*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
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
    		source: "(18:2) {#each Object.keys(folders) as startFolder (startFolder)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = Object.keys(/*folders*/ ctx[0]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*startFolder*/ ctx[7];
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

    			attr_dev(ul, "class", "svelte-1cz8t5t");
    			add_location(ul, file$3, 16, 0, 420);
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
    			if (dirty & /*selected, Object, folders, currentFolder, dispatch, FolderFilter*/ 15) {
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BuildFolderStruct', slots, []);
    	let { folders } = $$props;
    	let { selected } = $$props;
    	const dispatch = createEventDispatcher();
    	let currentFolder = "";
    	const writable_props = ['folders', 'selected'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BuildFolderStruct> was created with unknown prop '${key}'`);
    	});

    	const folderClicked_handler_1 = e => {
    		if (currentFolder === e.detail) {
    			dispatch("folderClicked", currentFolder);
    		} else {
    			$$invalidate(2, currentFolder = e.detail);
    		}
    	};

    	function folderClicked_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const folderClicked_handler_2 = e => {
    		if (currentFolder === e.detail) {
    			dispatch("folderClicked", currentFolder);
    		} else {
    			$$invalidate(2, currentFolder = e.detail);
    		}
    	};

    	$$self.$$set = $$props => {
    		if ('folders' in $$props) $$invalidate(0, folders = $$props.folders);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		FolderButton,
    		FolderWSButton,
    		FolderFilter,
    		folders,
    		selected,
    		dispatch,
    		currentFolder
    	});

    	$$self.$inject_state = $$props => {
    		if ('folders' in $$props) $$invalidate(0, folders = $$props.folders);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('currentFolder' in $$props) $$invalidate(2, currentFolder = $$props.currentFolder);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentFolder*/ 4) {
    			{
    				dispatch("folderClicked", currentFolder);
    			}
    		}
    	};

    	return [
    		folders,
    		selected,
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { folders: 0, selected: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BuildFolderStruct",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*folders*/ ctx[0] === undefined && !('folders' in props)) {
    			console.warn("<BuildFolderStruct> was created without expected prop 'folders'");
    		}

    		if (/*selected*/ ctx[1] === undefined && !('selected' in props)) {
    			console.warn("<BuildFolderStruct> was created without expected prop 'selected'");
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
    }

    const folderStruct = {
        G_files: ["cool.txt"],
        house: {
          G_files: ["home.txt"],
        },
        vids: {
          G_files: [],
          Date_2020: {
            G_files: ["pic1.png", "pic2.png"],
            coolPics5: {
              G_files: ["pic100.png"],
              Gerry: {
                G_files: ["cool.txt"],
                house: {
                  G_files: ["home.txt"],
                },
                vids: {
                  G_files: [],
                  Date_2020: {
                    G_files: ["pic1.png", "pic2.png"],
                    coolPics5: {
                      G_files: ["pic100.png"],
                    },
                  },
                  Date_2021: {
                    G_files: ["pic5.png", "pic6.png"],
                  },
                },
              },
            },
          },
          Date_2021: {
            G_files: ["pic5.png", "pic6.png"],
          },
        },
      };

    /* src\components\ToastNotification.svelte generated by Svelte v3.48.0 */
    const file$2 = "src\\components\\ToastNotification.svelte";

    function create_fragment$4(ctx) {
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
    			attr_dev(p, "class", "svelte-dx8qvc");
    			add_location(p, file$2, 12, 4, 296);
    			attr_dev(button, "class", "svelte-dx8qvc");
    			add_location(button, file$2, 13, 4, 317);
    			attr_dev(div0, "class", "notification-toast-inner svelte-dx8qvc");
    			add_location(div0, file$2, 11, 2, 252);
    			attr_dev(div1, "class", div1_class_value = "notification-toast " + /*type*/ ctx[0] + " svelte-dx8qvc");
    			add_location(div1, file$2, 10, 0, 209);
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

    			if (!current || dirty & /*type*/ 1 && div1_class_value !== (div1_class_value = "notification-toast " + /*type*/ ctx[0] + " svelte-dx8qvc")) {
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { type: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToastNotification",
    			options,
    			id: create_fragment$4.name
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
    const file_1$1 = "src\\components\\FilePreview.svelte";

    // (65:4) {:else}
    function create_else_block(ctx) {
    	let div;
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text(/*fileData*/ ctx[3]);
    			attr_dev(p, "class", "svelte-i3pczl");
    			add_location(p, file_1$1, 66, 8, 1899);
    			attr_dev(div, "id", "previewBoxView");
    			attr_dev(div, "class", "previewBoxView svelte-i3pczl");
    			add_location(div, file_1$1, 65, 6, 1841);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fileData*/ 8) set_data_dev(t, /*fileData*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(65:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:4) {#if fileData["video"]}
    function create_if_block$2(ctx) {
    	let video;
    	let source;
    	let source_src_value;

    	const block = {
    		c: function create() {
    			video = element("video");
    			source = element("source");
    			if (!src_url_equal(source.src, source_src_value = "http://localhost:5500/getVideoStream?location=" + (/*selected*/ ctx[0] + '/' + /*file*/ ctx[1]))) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file_1$1, 57, 8, 1644);
    			attr_dev(video, "id", "previewBoxView");
    			video.controls = true;
    			video.muted = "muted";
    			video.autoplay = true;
    			attr_dev(video, "class", "svelte-i3pczl");
    			add_location(video, file_1$1, 56, 6, 1575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, source);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected, file*/ 3 && !src_url_equal(source.src, source_src_value = "http://localhost:5500/getVideoStream?location=" + (/*selected*/ ctx[0] + '/' + /*file*/ ctx[1]))) {
    				attr_dev(source, "src", source_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(56:4) {#if fileData[\\\"video\\\"]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
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
    	let p2;
    	let t12;
    	let span2;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let div1;
    	let button1;
    	let t19;
    	let button2;
    	let t21;
    	let button3;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*fileData*/ ctx[3]["video"]) return create_if_block$2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			if_block.c();
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
    			t6 = text(/*fileSize*/ ctx[5]);
    			t7 = text(/*fileSizeUnit*/ ctx[4]);
    			t8 = space();
    			p1 = element("p");
    			t9 = text("Date created: ");
    			span1 = element("span");
    			t10 = text(t10_value);
    			t11 = space();
    			p2 = element("p");
    			t12 = text("Location: ");
    			span2 = element("span");
    			t13 = text("./");
    			t14 = text(/*selected*/ ctx[0]);
    			t15 = text("/");
    			t16 = text(/*file*/ ctx[1]);
    			t17 = space();
    			div1 = element("div");
    			button1 = element("button");
    			button1.textContent = "Download";
    			t19 = space();
    			button2 = element("button");
    			button2.textContent = "Share";
    			t21 = space();
    			button3 = element("button");
    			button3.textContent = "Delete";
    			attr_dev(div0, "class", "previewBox svelte-i3pczl");
    			add_location(div0, file_1$1, 54, 2, 1487);
    			attr_dev(button0, "class", "close-button svelte-i3pczl");
    			add_location(button0, file_1$1, 71, 4, 1986);
    			attr_dev(h1, "class", "svelte-i3pczl");
    			add_location(h1, file_1$1, 74, 4, 2099);
    			attr_dev(span0, "class", "svelte-i3pczl");
    			add_location(span0, file_1$1, 75, 13, 2133);
    			attr_dev(p0, "class", "svelte-i3pczl");
    			add_location(p0, file_1$1, 75, 4, 2124);
    			attr_dev(span1, "class", "svelte-i3pczl");
    			add_location(span1, file_1$1, 76, 21, 2197);
    			attr_dev(p1, "class", "svelte-i3pczl");
    			add_location(p1, file_1$1, 76, 4, 2180);
    			attr_dev(span2, "class", "svelte-i3pczl");
    			add_location(span2, file_1$1, 77, 17, 2255);
    			attr_dev(p2, "class", "svelte-i3pczl");
    			add_location(p2, file_1$1, 77, 4, 2242);
    			attr_dev(button1, "class", "downloadButton svelte-i3pczl");
    			add_location(button1, file_1$1, 79, 6, 2332);
    			attr_dev(button2, "class", "shareButton svelte-i3pczl");
    			add_location(button2, file_1$1, 80, 6, 2388);
    			attr_dev(button3, "class", "deleteButton svelte-i3pczl");
    			add_location(button3, file_1$1, 81, 6, 2438);
    			attr_dev(div1, "class", "actionButtons svelte-i3pczl");
    			add_location(div1, file_1$1, 78, 4, 2297);
    			attr_dev(div2, "class", "previewMeta svelte-i3pczl");
    			add_location(div2, file_1$1, 70, 2, 1955);
    			attr_dev(div3, "class", "preview svelte-i3pczl");
    			add_location(div3, file_1$1, 53, 0, 1462);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			if_block.m(div0, null);
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
    			append_dev(div2, p2);
    			append_dev(p2, t12);
    			append_dev(p2, span2);
    			append_dev(span2, t13);
    			append_dev(span2, t14);
    			append_dev(span2, t15);
    			append_dev(span2, t16);
    			append_dev(div2, t17);
    			append_dev(div2, div1);
    			append_dev(div1, button1);
    			append_dev(div1, t19);
    			append_dev(div1, button2);
    			append_dev(div1, t21);
    			append_dev(div1, button3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*closePreviewBox*/ ctx[7], false, false, false),
    					listen_dev(button0, "click", /*click_handler*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if (dirty & /*fileSize*/ 32) set_data_dev(t6, /*fileSize*/ ctx[5]);
    			if (dirty & /*fileSizeUnit*/ 16) set_data_dev(t7, /*fileSizeUnit*/ ctx[4]);
    			if (dirty & /*metadata*/ 4 && t10_value !== (t10_value = /*metadata*/ ctx[2].dateCreated + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*selected*/ 1) set_data_dev(t14, /*selected*/ ctx[0]);
    			if (dirty & /*file*/ 2) set_data_dev(t16, /*file*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots('FilePreview', slots, []);
    	const dispatch = createEventDispatcher();
    	let { selected } = $$props;
    	let { file } = $$props;
    	let { metadata } = $$props;
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

    	fetch(`http://localhost:5500/getFileData?location=./storage/${selected}/${file}`).then(response => response.json()).then(data => {
    		if (data["video"]) {
    			$$invalidate(3, fileData = { video: true });
    		} else {
    			$$invalidate(3, fileData = data.fileData);
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

    	const writable_props = ['selected', 'file', 'metadata'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FilePreview> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("hidePreview", true);

    	$$self.$$set = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('file' in $$props) $$invalidate(1, file = $$props.file);
    		if ('metadata' in $$props) $$invalidate(2, metadata = $$props.metadata);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		selected,
    		file,
    		metadata,
    		fileData,
    		fileSizeUnit,
    		fileSize,
    		closePreviewBox
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('file' in $$props) $$invalidate(1, file = $$props.file);
    		if ('metadata' in $$props) $$invalidate(2, metadata = $$props.metadata);
    		if ('fileData' in $$props) $$invalidate(3, fileData = $$props.fileData);
    		if ('fileSizeUnit' in $$props) $$invalidate(4, fileSizeUnit = $$props.fileSizeUnit);
    		if ('fileSize' in $$props) $$invalidate(5, fileSize = $$props.fileSize);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selected,
    		file,
    		metadata,
    		fileData,
    		fileSizeUnit,
    		fileSize,
    		dispatch,
    		closePreviewBox,
    		click_handler
    	];
    }

    class FilePreview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { selected: 0, file: 1, metadata: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FilePreview",
    			options,
    			id: create_fragment$3.name
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
    }

    /* src\components\File.svelte generated by Svelte v3.48.0 */
    const file_1 = "src\\components\\File.svelte";

    // (10:2) {#if previewShow}
    function create_if_block$1(ctx) {
    	let filepreview;
    	let current;

    	filepreview = new FilePreview({
    			props: {
    				file: /*file*/ ctx[1],
    				selected: /*selected*/ ctx[0],
    				metadata: /*metadata*/ ctx[2]
    			},
    			$$inline: true
    		});

    	filepreview.$on("hidePreview", /*hidePreview_handler*/ ctx[6]);

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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(10:2) {#if previewShow}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let li;
    	let t0;
    	let button0;
    	let t1;
    	let div;
    	let button1;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let button2;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let button3;
    	let img2;
    	let img2_src_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*previewShow*/ ctx[3] && create_if_block$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (if_block) if_block.c();
    			t0 = space();
    			button0 = element("button");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div = element("div");
    			button1 = element("button");
    			img0 = element("img");
    			t2 = space();
    			button2 = element("button");
    			img1 = element("img");
    			t3 = space();
    			button3 = element("button");
    			img2 = element("img");
    			attr_dev(button0, "class", "svelte-tck0pf");
    			add_location(button0, file_1, 17, 2, 336);
    			if (!src_url_equal(img0.src, img0_src_value = "icons/download.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Download");
    			attr_dev(img0, "class", "svelte-tck0pf");
    			add_location(img0, file_1, 19, 12, 436);
    			attr_dev(button1, "class", "svelte-tck0pf");
    			add_location(button1, file_1, 19, 4, 428);
    			if (!src_url_equal(img1.src, img1_src_value = "icons/share.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Share");
    			attr_dev(img1, "class", "svelte-tck0pf");
    			add_location(img1, file_1, 20, 12, 506);
    			attr_dev(button2, "class", "svelte-tck0pf");
    			add_location(button2, file_1, 20, 4, 498);
    			if (!src_url_equal(img2.src, img2_src_value = "icons/trash.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Trash");
    			attr_dev(img2, "class", "svelte-tck0pf");
    			add_location(img2, file_1, 21, 12, 570);
    			attr_dev(button3, "class", "svelte-tck0pf");
    			add_location(button3, file_1, 21, 4, 562);
    			attr_dev(div, "class", "stuff svelte-tck0pf");
    			add_location(div, file_1, 18, 2, 403);
    			attr_dev(li, "class", "svelte-tck0pf");
    			add_location(li, file_1, 8, 0, 170);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if (if_block) if_block.m(li, null);
    			append_dev(li, t0);
    			append_dev(li, button0);

    			if (default_slot) {
    				default_slot.m(button0, null);
    			}

    			append_dev(li, t1);
    			append_dev(li, div);
    			append_dev(div, button1);
    			append_dev(button1, img0);
    			append_dev(div, t2);
    			append_dev(div, button2);
    			append_dev(button2, img1);
    			append_dev(div, t3);
    			append_dev(div, button3);
    			append_dev(button3, img2);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button0, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*previewShow*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*previewShow*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(li, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('File', slots, ['default']);
    	let { selected } = $$props;
    	let { file } = $$props;
    	let { metadata } = $$props;
    	let previewShow = false;
    	const writable_props = ['selected', 'file', 'metadata'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<File> was created with unknown prop '${key}'`);
    	});

    	const hidePreview_handler = () => $$invalidate(3, previewShow = false);
    	const click_handler = () => $$invalidate(3, previewShow = true);

    	$$self.$$set = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('file' in $$props) $$invalidate(1, file = $$props.file);
    		if ('metadata' in $$props) $$invalidate(2, metadata = $$props.metadata);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		FilePreview,
    		selected,
    		file,
    		metadata,
    		previewShow
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('file' in $$props) $$invalidate(1, file = $$props.file);
    		if ('metadata' in $$props) $$invalidate(2, metadata = $$props.metadata);
    		if ('previewShow' in $$props) $$invalidate(3, previewShow = $$props.previewShow);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selected,
    		file,
    		metadata,
    		previewShow,
    		$$scope,
    		slots,
    		hidePreview_handler,
    		click_handler
    	];
    }

    class File extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { selected: 0, file: 1, metadata: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "File",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selected*/ ctx[0] === undefined && !('selected' in props)) {
    			console.warn("<File> was created without expected prop 'selected'");
    		}

    		if (/*file*/ ctx[1] === undefined && !('file' in props)) {
    			console.warn("<File> was created without expected prop 'file'");
    		}

    		if (/*metadata*/ ctx[2] === undefined && !('metadata' in props)) {
    			console.warn("<File> was created without expected prop 'metadata'");
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
    }

    /* src\components\FileStruct.svelte generated by Svelte v3.48.0 */
    const file$1 = "src\\components\\FileStruct.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (9:4) <File {selected} file={file.name} metadata={file.metadata}>
    function create_default_slot$1(ctx) {
    	let t0_value = /*file*/ ctx[2].name + "";
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
    			if (dirty & /*files*/ 1 && t0_value !== (t0_value = /*file*/ ctx[2].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(9:4) <File {selected} file={file.name} metadata={file.metadata}>",
    		ctx
    	});

    	return block;
    }

    // (8:2) {#each files as file}
    function create_each_block(ctx) {
    	let file_1;
    	let current;

    	file_1 = new File({
    			props: {
    				selected: /*selected*/ ctx[1],
    				file: /*file*/ ctx[2].name,
    				metadata: /*file*/ ctx[2].metadata,
    				$$slots: { default: [create_default_slot$1] },
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
    			if (dirty & /*files*/ 1) file_1_changes.file = /*file*/ ctx[2].name;
    			if (dirty & /*files*/ 1) file_1_changes.metadata = /*file*/ ctx[2].metadata;

    			if (dirty & /*$$scope, files*/ 33) {
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(8:2) {#each files as file}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let ul;
    	let current;
    	let each_value = /*files*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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

    			attr_dev(ul, "class", "svelte-getfkg");
    			add_location(ul, file$1, 6, 0, 105);
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
    			if (dirty & /*selected, files*/ 3) {
    				each_value = /*files*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FileStruct', slots, []);
    	let { files } = $$props;
    	let { selected } = $$props;
    	const writable_props = ['files', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FileStruct> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('files' in $$props) $$invalidate(0, files = $$props.files);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({ File, files, selected });

    	$$self.$inject_state = $$props => {
    		if ('files' in $$props) $$invalidate(0, files = $$props.files);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [files, selected];
    }

    class FileStruct extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { files: 0, selected: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileStruct",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*files*/ ctx[0] === undefined && !('files' in props)) {
    			console.warn("<FileStruct> was created without expected prop 'files'");
    		}

    		if (/*selected*/ ctx[1] === undefined && !('selected' in props)) {
    			console.warn("<FileStruct> was created without expected prop 'selected'");
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
    }

    /* src\App.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    // (46:0) {#if notification}
    function create_if_block(ctx) {
    	let toastnotification;
    	let current;

    	toastnotification = new ToastNotification({
    			props: {
    				type: "alert",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toastnotification.$on("close", /*close_handler*/ ctx[5]);

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

    			if (dirty & /*$$scope*/ 256) {
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(46:0) {#if notification}",
    		ctx
    	});

    	return block;
    }

    // (47:2) <ToastNotification      type="alert"      on:close={() => {        notification = false;      }}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Nice cool and tool");
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(47:2) <ToastNotification      type=\\\"alert\\\"      on:close={() => {        notification = false;      }}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t0;
    	let main;
    	let div;
    	let t2;
    	let section;
    	let p;
    	let t4;
    	let buildfolderstruct;
    	let t5;
    	let filestruct;
    	let current;
    	let if_block = /*notification*/ ctx[3] && create_if_block(ctx);

    	buildfolderstruct = new BuildFolderStruct({
    			props: {
    				folders: /*folderStruct2*/ ctx[1],
    				selected: /*selected*/ ctx[0]
    			},
    			$$inline: true
    		});

    	buildfolderstruct.$on("folderClicked", /*newLoc*/ ctx[4]);

    	filestruct = new FileStruct({
    			props: {
    				selected: /*selected*/ ctx[0],
    				files: /*currentFolderPathFiles*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			main = element("main");
    			div = element("div");
    			div.textContent = "lol";
    			t2 = space();
    			section = element("section");
    			p = element("p");
    			p.textContent = "Name";
    			t4 = space();
    			create_component(buildfolderstruct.$$.fragment);
    			t5 = space();
    			create_component(filestruct.$$.fragment);
    			attr_dev(div, "class", "sideFolder");
    			add_location(div, file, 54, 2, 1439);
    			add_location(p, file, 56, 4, 1513);
    			attr_dev(section, "class", "folder-part svelte-1593wea");
    			add_location(section, file, 55, 2, 1478);
    			attr_dev(main, "class", "svelte-1593wea");
    			add_location(main, file, 53, 0, 1429);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(main, t2);
    			append_dev(main, section);
    			append_dev(section, p);
    			append_dev(section, t4);
    			mount_component(buildfolderstruct, section, null);
    			append_dev(main, t5);
    			mount_component(filestruct, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*notification*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*notification*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const buildfolderstruct_changes = {};
    			if (dirty & /*folderStruct2*/ 2) buildfolderstruct_changes.folders = /*folderStruct2*/ ctx[1];
    			if (dirty & /*selected*/ 1) buildfolderstruct_changes.selected = /*selected*/ ctx[0];
    			buildfolderstruct.$set(buildfolderstruct_changes);
    			const filestruct_changes = {};
    			if (dirty & /*selected*/ 1) filestruct_changes.selected = /*selected*/ ctx[0];
    			if (dirty & /*currentFolderPathFiles*/ 4) filestruct_changes.files = /*currentFolderPathFiles*/ ctx[2];
    			filestruct.$set(filestruct_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(buildfolderstruct.$$.fragment, local);
    			transition_in(filestruct.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(buildfolderstruct.$$.fragment, local);
    			transition_out(filestruct.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(buildfolderstruct);
    			destroy_component(filestruct);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let selected = "none";
    	let folderStruct2 = folderStruct;
    	let currentFolderPathFiles = "";

    	fetch(`http://localhost:5500/fetchFiles?location=./storage`).then(response => response.json()).then(data => {
    		console.log(data);
    		$$invalidate(1, folderStruct2 = data.files);
    	});

    	const newLoc = ({ detail }) => {
    		$$invalidate(0, selected = detail);
    		detail = detail.split("/");
    		let files = folderStruct2[detail[0]];

    		for (let i = 1; i < detail.length; i++) {
    			files = files[detail[i]];
    		}

    		if (!files["G_files"]) {
    			$$invalidate(2, currentFolderPathFiles = []);
    			return;
    		}

    		$$invalidate(2, currentFolderPathFiles = !files["G_files"].length === 0 ? [] : files.G_files);
    	};

    	const addVal = () => {
    		$$invalidate(1, folderStruct2.house["nancy"] = { G_files: [] }, folderStruct2);
    		console.log("button");
    	};

    	const deleteSomething = () => {
    		$$invalidate(1, folderStruct2.vids.Date_2020 = {}, folderStruct2);
    		console.log(folderStruct2);
    	};

    	let notification = true;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const close_handler = () => {
    		$$invalidate(3, notification = false);
    	};

    	$$self.$capture_state = () => ({
    		BuildFolderStruct,
    		folderStruct,
    		ToastNotification,
    		FileStruct,
    		selected,
    		folderStruct2,
    		currentFolderPathFiles,
    		newLoc,
    		addVal,
    		deleteSomething,
    		notification
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('folderStruct2' in $$props) $$invalidate(1, folderStruct2 = $$props.folderStruct2);
    		if ('currentFolderPathFiles' in $$props) $$invalidate(2, currentFolderPathFiles = $$props.currentFolderPathFiles);
    		if ('notification' in $$props) $$invalidate(3, notification = $$props.notification);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selected,
    		folderStruct2,
    		currentFolderPathFiles,
    		notification,
    		newLoc,
    		close_handler
    	];
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
