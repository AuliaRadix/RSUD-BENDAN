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
const slider = document.getElementById('slider');
let slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.slider-btn-prev');
const nextBtn = document.querySelector('.slider-btn-next');

let index = 1;
let slideWidth;

// CLONE
const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);

firstClone.id = 'first-clone';
lastClone.id = 'last-clone';

slider.appendChild(firstClone);
slider.prepend(lastClone);

// UPDATE slides SETELAH CLONE
slides = document.querySelectorAll('.slide');

// INIT
function initSlider() {
    slideWidth = slides[0].clientWidth;
    slider.style.transition = 'none';
    slider.style.transform = `translateX(${-slideWidth * index}px)`;
}

window.addEventListener('load', () => {
    initSlider();
    startAutoSlide();
});

// NEXT
nextBtn.addEventListener('click', () => {
    if (index >= slides.length - 1) return;
    index++;
    slider.style.transition = 'transform 0.5s ease';
    slider.style.transform = `translateX(${-slideWidth * index}px)`;
    resetAutoSlide();
});

// PREV
prevBtn.addEventListener('click', () => {
    if (index <= 0) return;
    index--;
    slider.style.transition = 'transform 0.5s ease';
    slider.style.transform = `translateX(${-slideWidth * index}px)`;
    resetAutoSlide();
});

// CLONE RESET
slider.addEventListener('transitionend', () => {
    if (slides[index].id === 'first-clone') {
        slider.style.transition = 'none';
        index = 1;
        slider.style.transform = `translateX(${-slideWidth * index}px)`;
    }

    if (slides[index].id === 'last-clone') {
        slider.style.transition = 'none';
        index = slides.length - 2;
        slider.style.transform = `translateX(${-slideWidth * index}px)`;
    }
});

// AUTO SLIDE
let autoSlide;

function startAutoSlide() {
    autoSlide = setInterval(() => {
        index++;
        slider.style.transition = 'transform 0.5s ease';
        slider.style.transform = `translateX(${-slideWidth * index}px)`;
    }, 4000);
}

function resetAutoSlide() {
    clearInterval(autoSlide);
    startAutoSlide();
}

// RESPONSIVE
window.addEventListener('resize', initSlider);


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

/*------------------
    PPID Interaction
--------------------*/
$(document).ready(function () {
    // Inisialisasi Magnific Popup untuk gambar struktur
    $('.ppid-zoomable').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        mainClass: 'mfp-with-zoom',
        zoom: {
            enabled: true,
            duration: 300
        },
        callbacks: {
            elementParse: function (item) {
                item.src = item.el.attr('src');
            }
        }
    });
});

/*------------------
    Back to Top Button (Throttled)
--------------------*/
let scrollTimeout;
$(window).on('scroll', function () {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            if ($(window).scrollTop() > 300) {
                $('#backToTopBtn').addClass('show');
            } else {
                $('#backToTopBtn').removeClass('show');
            }
            scrollTimeout = null;
        }, 100);
    }
});

$('#backToTopBtn').on('click', function (e) {
    e.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, 1000);
});

/*------------------
    Info Card Animation (Optimized - Intersection Observer)
--------------------*/
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                $(entry.target).addClass('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.info-card').forEach(card => {
        observer.observe(card);
    });
}

document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;

        // Tutup yang lain (accordion mode)
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('open');
                item.querySelector('.faq-question').classList.remove('active');
            }
        });

        // Toggle current
        faqItem.classList.toggle('open');
        button.classList.toggle('active');
    });
});

/*------------------
    3D Carousel Logic (Optimized)
--------------------*/
$(document).ready(function () {
    const items = $('.carousel-3d-item');
    let currentIndex = 2; // Index item tengah (item-3)
    let autoRotate = null;
    let isVisible = true;

    function updateCarousel() {
        items.removeClass('item-1 item-2 item-3 item-4 item-5 active');
        items.each(function (index) {
            let pos = (index - currentIndex + 5) % 5 + 1;
            $(this).addClass('item-' + pos);
            if (pos === 3) $(this).addClass('active');
        });
    }

    $('.carousel-3d-next').on('click', function () {
        currentIndex = (currentIndex + 1) % 5;
        updateCarousel();
    });

    $('.carousel-3d-prev').on('click', function () {
        currentIndex = (currentIndex - 1 + 5) % 5;
        updateCarousel();
    });

    // Pause autoplay ketika halaman tidak terlihat (tab tidak aktif)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(autoRotate);
            isVisible = false;
        } else {
            isVisible = true;
            startAutoPlay();
        }
    });

    function startAutoPlay() {
        if (autoRotate) clearInterval(autoRotate);
        autoRotate = setInterval(() => {
            if (isVisible) {
                currentIndex = (currentIndex + 1) % 5;
                updateCarousel();
            }
        }, 3000);
    }

    // Start autoplay on load
    startAutoPlay();

    // Pause saat hover
    $('.carousel-3d-container').on('mouseenter', function () {
        clearInterval(autoRotate);
    }).on('mouseleave', function () {
        startAutoPlay();
    });
});

/*--------------------------
    Grafik Kunjungan Website Logic
----------------------------*/
$(document).ready(function() {
    const ctx = document.getElementById('visitChart');
    if (!ctx) return;

    // Mock Data
    const chartData = {
        day: {
            labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
            data: [450, 590, 800, 720, 950, 600, 400]
        },
        month: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            data: [12000, 15000, 14000, 18000, 22000, 19000, 25000, 23000, 21000, 24000, 20000, 28000]
        },
        year: {
            labels: ['2021', '2022', '2023', '2024'],
            data: [150000, 210000, 285000, 320000]
        }
    };

    // Initialize Chart
    let visitChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.day.labels,
            datasets: [{
                label: 'Jumlah Kunjungan',
                data: chartData.day.data,
                backgroundColor: 'rgba(19, 162, 183, 0.1)',
                borderColor: '#13a2b7',
                borderWidth: 3,
                fill: true,
                tension: 0.4, // Membuat garis melengkung lembut
                pointBackgroundColor: '#13a2b7',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f0f0f0' },
                    ticks: { font: { family: 'Poppins' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Poppins' } }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            }
        }
    });

    // Handle Button Clicks
    $('.chart-btn').on('click', function() {
        const period = $(this).data('period');
        
        // Update active class
        $('.chart-btn').removeClass('active');
        $(this).addClass('active');

        // Update Chart Data with animation
        visitChart.data.labels = chartData[period].labels;
        visitChart.data.datasets[0].data = chartData[period].data;
        visitChart.update();
    });
});

