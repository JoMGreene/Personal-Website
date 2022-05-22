"use strict";
const bottomOffset = 0;
const scrollElements = document.getElementsByClassName("js-scroll");
const elementInView = (el, offset = 0) => {
    const elementTop = el.getBoundingClientRect().top;
    return (elementTop <=
        (window.innerHeight || document.documentElement.clientHeight) - bottomOffset);
};
const elementOutofView = (el) => {
    const elementTop = el.getBoundingClientRect().top;
    return (elementTop > (window.innerHeight || document.documentElement.clientHeight));
};
const displayScrollElement = (element) => {
    element.classList.add("scrolled");
};
const hideScrollElement = (element) => {
    element.classList.remove("scrolled");
};
const handleScrollAnimation = () => {
    for (var i = 0; i < scrollElements.length; i++) {
        if (elementInView(scrollElements[i], bottomOffset)) {
            displayScrollElement(scrollElements[i]);
        }
        else if (elementOutofView(scrollElements[i])) {
            hideScrollElement(scrollElements[i]);
        }
    }
};
window.addEventListener('scroll', () => {
    handleScrollAnimation();
});
