// ==UserScript==
// @name         UQTP Improvements
// @namespace    kentonlam.xyz
// @version      0.4
// @description  Colours courses on UQ timetable planner.
// @author       Kenton Lam
// @match        https://timetableplanner.app.uq.edu.au/semesters/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

/* globals $ */

setTimeout(function() {
    'use strict';

    // https://css-tricks.com/snippets/javascript/lighten-darken-color/
    function LightenDarkenColor(col, amt) {
        var usePound = false;
        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }
        var num = parseInt(col,16);
        var r = (num >> 16) + amt;
        if (r > 255) r = 255;
        else if  (r < 0) r = 0;
        var b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255) b = 255;
        else if  (b < 0) b = 0;
        var g = (num & 0x0000FF) + amt;
        if (g > 255) g = 255;
        else if (g < 0) g = 0;
        return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    }

    const toArray = (x) => Array.prototype.slice.call(x, 0);
    const qs = (a, b) => typeof b == 'undefined' ? document.querySelector(a) : a.querySelector(b);
    const qsa = (a, b) => toArray(typeof b == 'undefined' ? document.querySelectorAll(a) : a.querySelectorAll(b));

    // colour names and hex codes from google calendar.
    // colours should be in hex.
    const colours = {
        'Tomato': '#D50000',
        'Flamingo': '#E67C73',
        'Tangerine': '#F4511E',
        'Banana': '#F6BF26',
        'Sage': '#33B679',
        'Basil': '#0B8043',
        'Peacock': '#039BE5',
        'Blueberry': '#3F51B5',
        'Lavender': '#7986CB',
        'Grape': '#8E24AA',
        'Graphite': '#616161',
        'Calendar color': '#4285F4'
    };

    // mapping of course code to colours. colour names are lowercased.
    // also supports course prefixes (e.g. MATH, CSSE)
    const courseColours = {
        'timetable-activity': 'calendar color', // default colour.
        MATH: 'peacock',
        CSSE: 'tangerine',
        STAT: 'basil',
        COMP: 'grape',
        ENGG: 'banana',
        DECO: 'blueberry',
        INFS: 'flamingo',
        ELEC: 'sage'
    };

    // icons for class types (lecture, practical, etc.)
    const activityIcons = {
        'L': '👨‍🏫',
        'P': '💻',
        'X': '📝',
        'C': '⚪',
        'T': '💡'
    };


    const C = {}
    Object.entries(colours).forEach(([name, hex]) => { C[name.toLowerCase()] = hex; });

    // mapping of singleStream[course][activity] to true/false
    // indicating if that activity has a single stream.
    const singleStream = {};

    const courseCodeRegex = /^[A-Z]+/;
    const colourTimetable = (mutations) => {
        colourCoursesSidebar();
        // for each timetabled event
        qsa('.timetable-activity').forEach((el) => {
            // add course code to class list.
            const courseCode = el.querySelector('.course-name').textContent;
            el.classList.add(courseCode);
            el.classList.add(courseCodeRegex.exec(courseCode)[0]);

            // if statement prevents recursion with observer.
            if (!el.firstElementChild.classList.contains('activity-icon')) {
                el.title = el.textContent; // show full text on hover

                // add icon corresponding to first letter of activity stream.
                const stream = el.querySelector('.activity-stream').textContent;
                if (singleStream[courseCode][stream])
                    el.classList.add('single-stream');
                const icon = activityIcons[stream[0]];
                if (icon)
                    el.insertAdjacentHTML('afterbegin', `<span class="activity-icon">${icon}</span> `);
            }
        });
    };

    const colourCoursesSidebar = () => {
        // add course code to class list for courses on the left sidebar.
        qsa('.course-item').forEach(courseEl => {
            const codeEl = qs(courseEl, '.info > .heading:first-child');
            const code = codeEl.textContent;
            codeEl.classList.add(code);
            codeEl.classList.add(courseCodeRegex.exec(code)[0]);

            qsa(courseEl, '.stream-selector').forEach(streamEl => {
                const stream = streamEl.textContent.split('\u2013')[1].trim(); // en dash
                if (!singleStream[code]) singleStream[code] = {};
                singleStream[code][stream] = qsa(streamEl.nextElementSibling, '.stream-name').length <= 1;
            });
        });
    };

    
    const timetable = qs('.timetable');
    console.assert(timetable, ".timetable element not found.");

    colourCoursesSidebar();
    colourTimetable();

    const config = { attributes: false, childList: true, subtree: true };
    const observer = new MutationObserver(colourTimetable);
    // watch for changes by Ember and update colours.
    observer.observe(timetable, config);

    /*
    const sidebarObserver = new MutationObserver(colourCoursesSidebar);
    sidebarObserver.observe(qs('.course-group'), { attributes: false, childList: true, subtree: false });
    */

    // generate css for courses
    let css = `
.course-item > .info > .heading:first-child {
    padding: 0 4px;
    border-radius: 5px;
}

.activity-icon {
    font-size: 150%;
    float: left;
    margin-right: 2px;
    margin-left: -2px;
}
`;
    Object.entries(courseColours).forEach(([course, colourName]) => {
        const colour = C[colourName];
        const darker = LightenDarkenColor(colour, -30);
        const w = 20;
        css += `
.${course}:not(.timetable-activity-candidate) {
    background-color: ${colour}
}

.${course}.single-stream:not(.timetable-activity-candidate) {
    background: repeating-linear-gradient(
        45deg,
        ${darker},
        ${darker} ${w}px,
        ${colour} ${w}px,
        ${colour} ${2*w}px
    );
}
`});
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}, 0);
