"use strict";

// selectors
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const btnCloseModal = document.querySelector(".btn--close-modal");
const btnsOpenModal = document.querySelectorAll(".btn--show-modal");

const btnScrollTo = document.querySelector(".btn--scroll-to");
const sectionOne = document.querySelector("#section--1");

const nav = document.querySelector(".nav");

const tabs = document.querySelectorAll(".operations__tab");
const tabsContainer = document.querySelector(".operations__tab-container");
const tabsContent = document.querySelectorAll(".operations__content");

// modal window functionality for buttons
const openModal = function () {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const closeModal = function (e) {
  e.preventDefault();
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

btnsOpenModal.forEach((btn) => btn.addEventListener("click", openModal));

btnCloseModal.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

// implementing smooth scrolling for nav bar (links)
/* document.querySelectorAll(".nav__link").forEach(function (el) {
  el.addEventListener("click", function (e) {
    e.preventDefault(); // so that links don't jump to #sections (ids)

    this is a pretty common technique to put the ID of the elements that we want to scroll to in the href attribute, so that then in the JS, we can read that href, and then we can select the element that we want to scroll to
    const id = this.getAttribute("href");
    document.querySelector(id).scrollIntoView({ behavior: "smooth" });
  });
}); */

/* the problem is that the above solution isn't really efficient, as we are adding the exact same callback function, the event handler, once to each of these three elements. the exact same function is now attached to these three elements, and that's unnecessary, it would be fine for only three elements, but if we had hundreds of elements, then we would be creating that much copies of the same function which would impact the performance, so the better solution is to use events delegation */

document.querySelector(".nav__links").addEventListener("click", function (e) {
  e.preventDefault();

  if (e.target.classList.contains("nav__link")) {
    const id = e.target.getAttribute("href");
    document.querySelector(id).scrollIntoView({ behavior: "smooth" });
  }
});

/* in event delegation, we use the fact that events bubble up, and we do that by putting the eventListener on a common parent of all the elements that we are interested in */

// implementing smooth scrolling for buttons
btnScrollTo.addEventListener("click", function (e) {
  /* getting the coordinates of the element we want to scroll to and manually calculating values
  const s1coords = sectionOne.getBoundingClientRect();

  console.log(s1coords);
  console.log(e.target.getBoundingClientRect());
  console.log("Current scroll (X/Y)", window.pageXOffset, window.pageYOffset);
  // to read the height and width of the viewport of the current portion visible on the screen
  console.log(
    "height/width viewport",
    document.documentElement.clientHeight, // doesn't count the scroll bar, it actually dimensions of the viewport
    document.documentElement.clientWidth
  ); 

  top here is relative to the viewport but not to the document, not of the top of the page basically, and the solution is to simply add the current scroll position to the top value, we then determine the position of the section not relative to viewport (top of the browser window), but top of the page
  window.scrollTo({
    left: s1coords.left + window.pageXOffset,
    top: s1coords.top + window.pageYOffset,
    behavior: "smooth",
  });
  but this is kind of a old school way of doing it, the modern way is much simpler but doesn't support older browsers */

  sectionOne.scrollIntoView({ behavior: "smooth" });
});

// creating fade out animation effect on the nav bar
const handlerHover = function (e) {
  // refactored this code into a function because the same code repeated in both handler functions with just the opacity value changing
  if (e.target.classList.contains("nav__link")) {
    const link = e.target;
    /* now we need to select the sibling elements meaning all the other links, and we can do that by going to the parent and then selecting the children from there, in our case, the parent of nav_link is this nav_item, and the only thing that nav_item includes is just one link, and so to move up manually, we'll have to do it twice, but instead of doing that, we will use the closest method so we can simply search for a parent which matches a certain query, and that's a bit more robust because even if at some point if we were to change the structure of our HTML, even then our JS would keep working */
    const siblings = link.closest(".nav").querySelectorAll(".nav__link");
    const logo = link.closest(".nav").querySelector("img");

    siblings.forEach((el) => {
      if (el !== link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};

/* as the bind method creates a copy of the function that it's called on, and it will set the value we pass into bind in event handler to this keyword in our above function, so this keyword becomes our opacity, and also by default the this keyword is the same as the current target, and note that this keyword becomes whatever value that we pass into bind, so essentially, we use the bind method here to pass an argument into a handler function, any handler function can only ever have one real argument, so we can only ever have one real parameter that is the event, but if we want to pass additional values into the handler function, then we need to use the this keywords, and if we wanted multiple values, then we could of course, pass in an array or object instead of just one value */

// this is how we pass arguments into a handler function
nav.addEventListener("mouseover", handlerHover.bind(0.5)); // mouseenter doesn't bubble up, so we can't use event delegation here
nav.addEventListener("mouseout", handlerHover.bind(1)); // mouseout event, to undo what we did above

// implementing sticky nav bar
/* const initialCoords = sectionOne.getBoundingClientRect();
window.addEventListener("scroll", function () {
  // when we reach the end of the first section the distance becomes greater so nav becomes sticky
  if (this.window.scrollY > initialCoords.top) {
    nav.classList.add("sticky");
  } else {
    nav.classList.remove("sticky");
  }
}); */

/* the above solution is bad for performance, using the scroll event for performing a certain action at a certain position of the page is really not the way to go because the scroll event here fires all the time meaning becomes active, no matter how small the change is in the scroll on the browser, so use the solution below which is the intersection API, so we want our nav bar to become sticky when the header moves completely out of the view, so we are gonna observe the header element */

const header = document.querySelector(".header");
const navHeight = nav.getBoundingClientRect().height;
// console.log(navHeight);

const stickyNav = function (entries) {
  const [entry] = entries; // same as entries[0], to get the first element
  // console.log(entry);
  // when the target is not intersecting the root
  if (!entry.isIntersecting) nav.classList.add("sticky");
  else nav.classList.remove("sticky");
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0, // when zero percent of the header is visible
  rootMargin: `-${navHeight}px`,
  /* to create the effect, we need the distance between the start of the new section and the viewport of the header before the line to be the same, rootmargin will create a box of 80px that will be applied outside of our target element, so 80px will create it before, which is the height of the nav bar, but to get the height dynamically and for that we have to use getboundingclientrec function, because for a responsive site we can't have a hardcoded value, as the size of elements will change at certain point */
});
headerObserver.observe(header);

// implementing functionality that reveals sections (an animation) as we scroll down close to them
const allSections = document.querySelectorAll(".section");

const revealSection = function (entries, observer) {
  const [entry] = entries;
  // console.log(entry);
  if (!entry.isIntersecting) return;
  entry.target.classList.remove("section--hidden");
  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add("section--hidden");
});

/* one of the most important things when building any website is performance, and images have by far the biggest impact on page loading, so it's very important to optimize images for any page, and for that we can use a strategy called lazy loading images */

// implementing lazy loading on images
const imgTargets = document.querySelectorAll("img[data-src]"); // selecting images with only data-src attribute
// console.log(imgTargets);
const loadImg = function (entries, observer) {
  const [entry] = entries;
  // console.log(entry);
  if (!entry.isIntersecting) return;

  // replacing src attribute with data-src attribute
  entry.target.src = entry.target.dataset.src;
  /* now we need to remove the class that has the blur filter, it's a little bit tricky, the replacing of the src attribute happens behind the scenes, so JS finds the new image that it should load and display here, and once its finished loading that image it will emit the load event, so we listen for that event, once the events happens of replacing then we can remove the class, and it's best to remove the filter once the images load so not before the loading */
  entry.target.addEventListener("load", function () {
    entry.target.classList.remove("lazy-img");
  });

  // stop observing these images once they load because that would be unneccesary and it would impact performance
  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: "200px",
  /* we want the images to load a little bit before we actually reach them, so ideally we don't want our users to notice that we are lazy loading these images, so all of this should happen in the background without the user noticing it, so to make these images load a little bit earlier, we can use rootmargin to load the images before the threshold is actually reached */
});

imgTargets.forEach((img) => imgObserver.observe(img));

// building tabbed component
tabsContainer.addEventListener("click", function (e) {
  // it finds the closest parent with this class name which are the buttons themselves, and we need this because of span inside buttons
  const clicked = e.target.closest(".operations__tab");

  // guard clause, for when we click on the tab container it returns null as there is no parent element
  if (!clicked) return;

  // before adding the active class we remove it from all the buttons and contents tab
  tabs.forEach((t) => t.classList.remove("operations__tab--active"));
  tabsContent.forEach((c) => c.classList.remove("operations__content--active"));

  clicked.classList.add("operations__tab--active");
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add("operations__content--active");
});

// building slider component functionality
const slides = document.querySelectorAll(".slide");
const btnRight = document.querySelector(".slider__btn--right");
const btnLeft = document.querySelector(".slider__btn--left");
const dotContainer = document.querySelector(".dots");

let curSlide = 0;
const maxSlide = slides.length;

/* const slider = document.querySelector(".slider");
slider.style.transform = "Scale(0.5) translateX(-500px)";
slider.style.overflow = "visible"; */
// slides.forEach((s, i) => (s.style.transform = `translateX(${i * 100}%)`)); // turned it into a function

// rearranging the slides position at 0, 100, 200 and so on
const goToSlide = function (slide) {
  slides.forEach(
    (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
  );
};

const nextSlide = function () {
  if (curSlide === maxSlide - 1) curSlide = 0;
  else curSlide++;

  goToSlide(curSlide);
  activateDot(curSlide);
};

const previousSlide = function () {
  if (curSlide === 0) curSlide = maxSlide - 1;
  else curSlide--;

  goToSlide(curSlide);
  activateDot(curSlide);
};

btnRight.addEventListener("click", nextSlide);
btnLeft.addEventListener("click", previousSlide);

document.addEventListener("keydown", function (e) {
  // keydown for when the key is pressed
  // console.log(e); // we look for key
  if (e.key === "ArrowRight") nextSlide();
  e.key === "ArrowLeft" && previousSlide(); // with short-circuiting
});

/* each dot is gonna be one element which we'll give a class, and the data attribute to each slide holding the number of slide that clicking the button (dot) will go to, so the data attribute holds the data we need to make this functionality work */

const createDots = function () {
  slides.forEach(function (_, i) {
    dotContainer.insertAdjacentHTML(
      "beforeend",
      `<button class="dots__dot" data-slide="${i}"></button>`
    );
  });
};

const activateDot = function (slide) {
  document
    .querySelectorAll(".dots__dot")
    .forEach((dot) => dot.classList.remove("dots__dot--active"));

  // selecting based on data slide attribute
  document
    .querySelector(`.dots__dot[data-slide="${slide}"]`)
    .classList.add("dots__dot--active");
};

dotContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("dots__dot")) {
    const { slide } = e.target.dataset; // as all the custom attributes are in the dataset
    goToSlide(slide);
    activateDot(slide);
  }
});

const init = function () {
  goToSlide(0);
  createDots();
  activateDot(0);
};

init();
