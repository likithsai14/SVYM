document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin Organization page loaded.");
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("click", () => {
      const isActive = item.classList.toggle("active");
      console.log(`FAQ item toggled. Active: ${isActive}`);

      if (isActive) {
        answer.style.maxHeight = answer.scrollHeight + "px";  
      } else {
        answer.style.maxHeight = "0";  
      }
    });
  });
});
