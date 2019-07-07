# UQTP Improvements
Userscript to colour courses on UQ timetable planner.

### How to use
1. Install [Tampermonkey](https://www.tampermonkey.net/) (recommended and supports Chrome, Edge, Safari, Opera Next and Firefox) or similar.
2. Install the script by clicking here: [uqtp_improvements.user.js](https://github.com/KentonLam/UQTP-Improvements/raw/master/uqtp_improvements.user.js).

If you want to set your own colours, change this section. Colour names are from Google calendar.
```javascript
const courseColours = {
    MATH3204: 'peacock',
    CSSE2310: 'tangerine',
    STAT2004: 'basil',
    COMP3506: 'grape'
};
```
### Screenshot
Striped events only have one available time-slot and can't be moved.

<img src="https://i.imgur.com/qdDAk3R.png" height=500>
