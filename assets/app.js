
  // Mobile menu
  const mobileMenu = document.getElementById("mobileMenu");
  const btnMobileMenu = document.getElementById("btnMobileMenu");
  const btnCloseMobile = document.getElementById("btnCloseMobile");

  if (btnMobileMenu && mobileMenu) {
    btnMobileMenu.addEventListener("click", () => mobileMenu.classList.remove("hidden"));
  }
  if (btnCloseMobile && mobileMenu) {
    btnCloseMobile.addEventListener("click", () => mobileMenu.classList.add("hidden"));
  }
  if (mobileMenu) {
    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) mobileMenu.classList.add("hidden");
    });
  }

  // Active nav (por data-page en body)
  const current = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach(a => {
    if (a.dataset.nav === current) a.classList.add("bg-gray-800");
  });

