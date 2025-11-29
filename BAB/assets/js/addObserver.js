'use strict';
function addObserver(obj) {
    let observer = new MutationObserver(mutationRecords => {
        console.log(mutationRecords); // console.log(the changes)
    });

    observer.observe(obj, {
        childList: true, // observe direct children
        subtree: true, // and lower descendants too
        characterDataOldValue: true // pass old data to callback
    });
}
addObserver(document.body);
