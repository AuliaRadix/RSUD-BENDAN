/* ---------------------------------------------------
    Templater Name: Aesthetic
    Description: Aesthetic medical template
    Author: Colorlib
---------------------------------------------------------  */

'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        if ($('.gallery__container').length > 0) {
            $('.gallery__container').masonry({
                columnWidth: '.grid-sizer',
                itemSelector: '.gc__item',
                gutter: 20
            });
        }
    });

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    /*------------------
        Fungsi Inisialisasi Komponen Header & Active Link
        (Dipanggil setelah header.html dimuat)
    --------------------*/
    function initHeaderPlugins() {
        // 1. Logika Highlight Menu Aktif yang Diperbaiki
        var fullPath = window.location.pathname;
        var currentPath = fullPath.split("/").pop();

        // Default ke index.html jika path kosong
        if (currentPath === "" || currentPath === "/" || currentPath.indexOf(".") === -1) {
            currentPath = "index.html";
        }

        // Hapus semua class active bawaan sebelum memulai pencocokan
        $(".header__menu ul li, .sidebar__menu ul li").removeClass('active');

        $(".header__menu ul li a, .sidebar__menu ul li a").each(function () {
            var getHref = $(this).attr('href');
            if (!getHref || getHref === "#" || getHref.startsWith("javascript:")) return;

            // Normalisasi href: hapus './', '../', dan ambil nama filenya saja
            var cleanHref = getHref.replace(/^\.\//, '').replace(/^\.\.\//, '').split("/").pop();

            // Lakukan perbandingan (case-insensitive untuk keamanan)
            if (cleanHref.toLowerCase() === currentPath.toLowerCase()) {
                // Tambahkan class active ke li parent (langsung - link yang match)
                $(this).parent('li').addClass('active');

                // Jika ini adalah dropdown item, tambahkan active ke parent dropdown toggle
                var dropdownParent = $(this).closest('ul.dropdown').parent('li');
                if (dropdownParent.length) {
                    dropdownParent.addClass('active');
                    // Buka dropdown ini otomatis
                    dropdownParent.find('> ul.dropdown').addClass('show');
                    dropdownParent.addClass('open');
                }
            }
        });

        // 2. Mobile Nav (Slicknav)
        $(".header__menu").slicknav({
            prependTo: '#mobile-menu-wrap',
            allowParentLinks: true,
            'closedSymbol': '<i class="fa fa-angle-right"></i>',
            'openedSymbol': '<i class="fa fa-angle-up"></i>',
        });

        // 3. Sidebar Toggle
        $("#burgerBtn").on('click', function () {
            $("#sidebar").addClass('active');
            $("#sidebarOverlay").addClass('active');
        });

        $("#sidebarOverlay, #sidebarClose").on('click', function () {
            $("#sidebar").removeClass('active');
            $("#sidebarOverlay").removeClass('active');
        });


    }

    /*------------------
        Load HTML Components
    --------------------*/
    async function loadComponent() {
        try {
            // Muat Header & Sidebar ke ID header-site
            const headerRes = await fetch('header.html');
            const headerData = await headerRes.text();
            const headerElement = document.getElementById('header-site');

            if (headerElement) {
                headerElement.innerHTML = headerData;
                initHeaderPlugins(); // Menjalankan logika menu aktif setelah HTML masuk
            }

            // Muat Footer ke ID footer-site
            const footerRes = await fetch('footer.html');
            const footerData = await footerRes.text();
            const footerElement = document.getElementById('footer-site');

            if (footerElement) {
                footerElement.innerHTML = footerData;
            }
        } catch (error) {
            console.error("Gagal memuat komponen:", error);
        }
    }

    $(document).ready(function () {
        loadComponent();
    });

    /*------------------
    Sidebar Dropdown Logic (Accordion Effect) - Using Event Delegation
--------------------*/
    // Use event delegation so it works even after HTML reload
    $(document).on('click', '.sidebar__menu li.has-dropdown > a', function (e) {
        e.preventDefault();
        var $parent = $(this).parent('li');
        var $dropdown = $parent.find('> .dropdown');

        if (!$dropdown.length) return; // Exit if no dropdown found

        // Check if this item is already open
        if ($parent.hasClass('open')) {
            // Close this dropdown
            $dropdown.removeClass('show').addClass('closing');
            $parent.removeClass('open');

            // Remove closing class after animation
            setTimeout(function () {
                $dropdown.removeClass('closing');
            }, 400);
        } else {
            // Close all other dropdowns at the same level (Accordion effect)
            $parent.siblings('.has-dropdown.open').each(function () {
                var $sibling = $(this);
                var $siblingDropdown = $sibling.find('> .dropdown');
                $siblingDropdown.removeClass('show').addClass('closing');
                $sibling.removeClass('open');

                setTimeout(function () {
                    $siblingDropdown.removeClass('closing');
                }, 400);
            });

            // Open this dropdown
            $dropdown.addClass('show');
            $parent.addClass('open');
        }
    });

    // Close sidebar on overlay click - Also using event delegation
    $(document).on('click', '#sidebarOverlay, #sidebarClose', function () {
        $('#sidebar').removeClass('active');
        $('#sidebarOverlay').removeClass('active');

        // Close all open dropdowns when sidebar is closed
        setTimeout(function () {
            $('.sidebar__menu li.has-dropdown').each(function () {
                var $li = $(this);
                var $dropdown = $li.find('> .dropdown');
                $dropdown.removeClass('show');
                $li.removeClass('open');
            });
        }, 300);
    });

    /*------------------
        Plugin Lainnya
    --------------------*/
    // Testimonial
    $(".testimonial__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 2,
        dots: true,
        smartSpeed: 1200,
        autoplay: true,
        responsive: { 768: { items: 2 }, 0: { items: 1 } }
    });

    // Magnific Popup
    $('.video-popup').magnificPopup({ type: 'iframe' });
    $('.image-popup').magnificPopup({ type: 'image' });

    // Nice Select & Datepicker
    $("select").niceSelect();
    $(".datepicker").datepicker({ minDate: 0 });

    // Slider Navigation Buttons
    const prevButton = document.querySelector('.slider-btn-prev');
    const nextButton = document.querySelector('.slider-btn-next');
    if (prevButton) prevButton.addEventListener('click', prevSlide);
    if (nextButton) nextButton.addEventListener('click', nextSlide);

    // Service Modal Opening - Click on service cards
    document.querySelectorAll('.service-card[data-modal]').forEach(card => {
        card.addEventListener('click', function (e) {
            const modalId = this.getAttribute('data-modal');
            openServiceModal(modalId);
        });
    });

    // Service Modal Closing - Click on close buttons/spans
    document.querySelectorAll('[data-close-modal]').forEach(closeBtn => {
        closeBtn.addEventListener('click', function () {
            const modalId = this.getAttribute('data-close-modal');
            closeServiceModal(modalId);
        });
    });

    // Escape Key to Close Sidebar
    $(document).on('keydown', function (e) {
        if (e.key === "Escape") {
            $("#sidebar").removeClass('active');
            $("#sidebarOverlay").removeClass('active');
        }
    });

})(jQuery);

/*--------------------------
    Background Slider (Global)
----------------------------*/
let currentSlide = 0;
let slideInterval;

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const slider = document.querySelector('.slider');
    if (!slider || slides.length === 0) return;

    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function prevSlide() {
    showSlide(currentSlide - 1);
    resetSlideTimer();
}

function nextSlide() {
    showSlide(currentSlide + 1);
    resetSlideTimer();
}

function startSlideTimer() {
    slideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000); // Slide otomatis setiap 5 detik
}

function resetSlideTimer() {
    clearInterval(slideInterval);
    startSlideTimer();
}

// Mulai slider otomatis saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
    startSlideTimer();
});

/*--------------------------
    Google Drive Direct Download Links
----------------------------*/
document.addEventListener("DOMContentLoaded", function () {
    // Mengambil semua link di dalam list dokumen
    const links = document.querySelectorAll('.about__list_document a');

    links.forEach(link => {
        const originalHref = link.getAttribute('href');

        // Regex untuk mendeteksi ID Google Drive
        const driveRegex = /\/d\/(.+?)\/(?:view|edit|usp)/;
        const match = originalHref.match(driveRegex);

        if (match && match[1]) {
            const fileId = match[1];
            // Mengubah href menjadi link direct download
            const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
            link.setAttribute('href', directDownloadUrl);
        }
    });
})

/*--------------------------
    Pelayanan Modal Logic - Enhanced
----------------------------*/
function openServiceModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Hitung lebar scrollbar agar konten tidak bergeser
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        $('body').css('padding-right', scrollbarWidth + 'px');
        $('body').css('overflow', 'hidden');

        // Tampilkan modal dan trigger animasi
        $(modal).css('display', 'flex');
        setTimeout(() => {
            $(modal).addClass('active');
        }, 10);

        // Scroll modal content ke atas
        $(modal).find('.service-modal__body').scrollTop(0);
    }
}

function closeServiceModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        $(modal).removeClass('active');

        setTimeout(() => {
            $(modal).css('display', 'none');
            $('body').css('overflow', '');
            $('body').css('padding-right', '');
        }, 400);
    }
}

// Tutup modal jika user klik area luar konten
$(document).on('click', function (event) {
    if ($(event.target).hasClass('service-modal') && $(event.target).hasClass('active')) {
        const modalId = $(event.target).attr('id');
        closeServiceModal(modalId);
    }
});

// Tutup modal dengan tombol ESC
$(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.service-modal.active');
        if (activeModal) {
            closeServiceModal(activeModal.id);
        }
    }
});

// Set Copyright Year
function setCopyrightYear() {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
}

// Initialize on document ready
$(document).ready(function () {
    setCopyrightYear();
});
