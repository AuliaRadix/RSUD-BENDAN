/* ---------------------------------------------------
    Templater Name: Aesthetic
    Description: Aesthetic medical template
    Author: Colorlib
---------------------------------------------------------  */

'use strict';

(function ($) {

    // ============================================
    // 1. INITIALIZATION & UTILITIES
    // ============================================

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
        Header & Navigation Init
    --------------------*/
    function initHeaderPlugins() {
        var fullPath = window.location.pathname;
        var currentPath = fullPath.split("/").pop() || "index.html";

        $(".header__menu ul li, .sidebar__menu ul li").removeClass('active');

        $(".header__menu ul li a, .sidebar__menu ul li a").each(function () {
            var getHref = $(this).attr('href');
            if (!getHref || getHref === "#" || getHref.startsWith("javascript:")) return;

            var cleanHref = getHref.replace(/^\.\//, '').replace(/^\.\.\//, '').split("/").pop();

            if (cleanHref.toLowerCase() === currentPath.toLowerCase()) {
                $(this).parent('li').addClass('active');

                var dropdownParent = $(this).closest('ul.dropdown').parent('li');
                if (dropdownParent.length) {
                    dropdownParent.addClass('active');
                    dropdownParent.find('> ul.dropdown').addClass('show');
                    dropdownParent.addClass('open');
                }
            }
        });

        // Mobile Nav
        $(".header__menu").slicknav({
            prependTo: '#mobile-menu-wrap',
            allowParentLinks: true,
            'closedSymbol': '<i class="fa fa-angle-right"></i>',
            'openedSymbol': '<i class="fa fa-angle-up"></i>',
        });

        // Sidebar Toggle
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
            const headerRes = await fetch('header.html');
            const headerData = await headerRes.text();
            const headerElement = document.getElementById('header-site');

            if (headerElement) {
                headerElement.innerHTML = headerData;
                initHeaderPlugins();
            }

            const footerRes = await fetch('footer.html');
            const footerData = await footerRes.text();
            const footerElement = document.getElementById('footer-site');

            if (footerElement) {
                footerElement.innerHTML = footerData;

                // Inisialisasi Peta Leaflet setelah footer dimuat
                var checkLeaflet = setInterval(function () {
                    if (typeof L !== 'undefined' && document.getElementById('map')) {
                        clearInterval(checkLeaflet);
                        var map = L.map('map').setView([-6.8914744, 109.6615158], 17);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(map);
                        L.marker([-6.8914744, 109.6615158]).addTo(map).bindPopup('<b>RSUD Bendan</b><br>Jl. Sriwijaya No.2, Pekalongan').openPopup();
                    }
                }, 100);
            }
        } catch (error) {
            console.error("Gagal memuat komponen:", error);
        }
    }

    $(document).ready(function () {
        loadComponent();
        setCopyrightYear();
    });

    // ============================================
    // 2. SIDEBAR & DROPDOWN LOGIC
    // ============================================

    $(document).on('click', '.sidebar__menu li.has-dropdown > a', function (e) {
        e.preventDefault();
        var $parent = $(this).parent('li');
        var $dropdown = $parent.find('> .dropdown');

        if (!$dropdown.length) return;

        if ($parent.hasClass('open')) {
            $dropdown.removeClass('show').addClass('closing');
            $parent.removeClass('open');
            setTimeout(function () { $dropdown.removeClass('closing'); }, 400);
        } else {
            $parent.siblings('.has-dropdown.open').each(function () {
                var $sibling = $(this);
                var $siblingDropdown = $sibling.find('> .dropdown');
                $siblingDropdown.removeClass('show').addClass('closing');
                $sibling.removeClass('open');
                setTimeout(function () { $siblingDropdown.removeClass('closing'); }, 400);
            });

            $dropdown.addClass('show');
            $parent.addClass('open');
        }
    });

    $(document).on('click', '#sidebarOverlay, #sidebarClose', function () {
        $('#sidebar').removeClass('active');
        $('#sidebarOverlay').removeClass('active');

        setTimeout(function () {
            $('.sidebar__menu li.has-dropdown').each(function () {
                var $li = $(this);
                var $dropdown = $li.find('> .dropdown');
                $dropdown.removeClass('show');
                $li.removeClass('open');
            });
        }, 300);
    });

    // ============================================
    // 3. PLUGINS INITIALIZATION
    // ============================================

    // Testimonial Carousel
    $(".testimonial__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 2,
        dots: true,
        smartSpeed: 1200,
        autoplay: true,
        responsive: { 768: { items: 2 }, 0: { items: 1 } }
    });

    // Popups
    $('.video-popup').magnificPopup({ type: 'iframe' });
    $('.image-popup').magnificPopup({ type: 'image' });

    // Form Elements
    $("select").niceSelect();
    $(".datepicker").datepicker({ minDate: 0 });

    // Service Modals
    document.querySelectorAll('.service-card[data-modal]').forEach(card => {
        card.addEventListener('click', function () {
            const modalId = this.getAttribute('data-modal');
            openServiceModal(modalId);
        });
    });

    document.querySelectorAll('[data-close-modal]').forEach(closeBtn => {
        closeBtn.addEventListener('click', function () {
            const modalId = this.getAttribute('data-close-modal');
            closeServiceModal(modalId);
        });
    });

    // Escape Key
    $(document).on('keydown', function (e) {
        if (e.key === "Escape") {
            $("#sidebar").removeClass('active');
            $("#sidebarOverlay").removeClass('active');
        }
    });

})(jQuery);

// ============================================
// 4. BACKGROUND SLIDER
// ============================================

const slider = document.getElementById('slider');
if (slider) {
    let slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-btn-prev');
    const nextBtn = document.querySelector('.slider-btn-next');

    let index = 1;
    let slideWidth;
    let autoSlide;

    // Clone first & last slides
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.id = 'first-clone';
    lastClone.id = 'last-clone';

    slider.appendChild(firstClone);
    slider.prepend(lastClone);
    slides = document.querySelectorAll('.slide');

    function initSlider() {
        slideWidth = slides[0].clientWidth;
        slider.style.transition = 'none';
        slider.style.transform = `translateX(${-slideWidth * index}px)`;
    }

    function startAutoSlide() {
        autoSlide = setInterval(() => {
            if (index >= slides.length - 1) return;
            index++;
            slider.style.transition = 'transform 0.5s ease';
            slider.style.transform = `translateX(${-slideWidth * index}px)`;
        }, 4000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlide);
        startAutoSlide();
    }

    window.addEventListener('load', () => {
        initSlider();
        startAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
        if (index <= 0) return;
        index--;
        slider.style.transition = 'transform 0.5s ease';
        slider.style.transform = `translateX(${-slideWidth * index}px)`;
        resetAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
        if (index >= slides.length - 1) return;
        index++;
        slider.style.transition = 'transform 0.5s ease';
        slider.style.transform = `translateX(${-slideWidth * index}px)`;
        resetAutoSlide();
    });

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

    window.addEventListener('resize', initSlider);
}
// ============================================
// 5. GOOGLE DRIVE LINKS & UTILITIES
// ============================================

function setupDriveLinks() {
    const links = document.querySelectorAll('.about__list_document a');
    links.forEach(link => {
        if (link.dataset.driveProcessed) return;

        const href = link.getAttribute("href");
        if (!href || !href.includes("drive.google.com")) return;

        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const match = href.match(/\/d\/([^\/\?]+)/);
        if (match) {
            link.href = `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
        link.dataset.driveProcessed = "true";
    });
}

const driveObserver = new MutationObserver(setupDriveLinks);
driveObserver.observe(document.body, { childList: true, subtree: true });
setupDriveLinks();

// ============================================
// 6. MODAL FUNCTIONS
// ============================================

function openServiceModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    $('body').css('padding-right', scrollbarWidth + 'px').css('overflow', 'hidden');
    $(modal).css('display', 'flex');

    setTimeout(() => { $(modal).addClass('active'); }, 10);
    $(modal).find('.service-modal__body').scrollTop(0);
}

function closeServiceModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    $(modal).removeClass('active');
    setTimeout(() => {
        $(modal).css('display', 'none');
        $('body').css('overflow', '').css('padding-right', '');
    }, 400);
}

$(document).on('click', function (event) {
    if ($(event.target).hasClass('service-modal') && $(event.target).hasClass('active')) {
        closeServiceModal($(event.target).attr('id'));
    }
});

$(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.service-modal.active');
        if (activeModal) closeServiceModal(activeModal.id);
    }
});

// ============================================
// 7. UTILITY FUNCTIONS
// ============================================

function setCopyrightYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ============================================
// 8. Gambar ZOOM
// ============================================

$(document).ready(function () {
    $('.ppid-zoomable, .infographic-zoom').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        mainClass: 'mfp-with-zoom',
        zoom: { enabled: true, duration: 300 },
        callbacks: {
            elementParse: function (item) {
                item.src = item.el.attr('src');
            }
        }
    });
});

// ============================================
// 9. BACK TO TOP BUTTON
// ============================================

const backToTopBtn = document.getElementById('backToTopBtn');

let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {

            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }

            ticking = false;
        });

        ticking = true;
    }
});

backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();

    window.scrollTo({
        top: 0,
        behavior: 'smooth' // native smooth (lebih ringan dari jQuery animate)
    });
});


// ============================================
// 10. INFO CARDS & FAQ ACCORDION
// ============================================

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

        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('open');
                item.querySelector('.faq-question').classList.remove('active');
            }
        });

        faqItem.classList.toggle('open');
        button.classList.toggle('active');
    });
});

// ============================================
// 11. 3D CAROUSEL
// ============================================

$(document).ready(function () {
    const items = $('.carousel-3d-item');
    let currentIndex = 2;
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

    $('.carousel-3d-next').on('click', () => {
        currentIndex = (currentIndex + 1) % 5;
        updateCarousel();
    });

    $('.carousel-3d-prev').on('click', () => {
        currentIndex = (currentIndex - 1 + 5) % 5;
        updateCarousel();
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

    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible) startAutoPlay();
        else clearInterval(autoRotate);
    });

    startAutoPlay();

    $('.carousel-3d-container')
        .on('mouseenter', () => clearInterval(autoRotate))
        .on('mouseleave', startAutoPlay);
});

// ============================================
// 12. VISIT CHART
// ============================================

$(document).ready(function () {
    const ctx = document.getElementById('visitChart');
    if (!ctx) return;

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
                tension: 0.4,
                pointBackgroundColor: '#13a2b7',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
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
            interaction: { intersect: false, mode: 'index' }
        }
    });

    $('.chart-btn').on('click', function () {
        const period = $(this).data('period');
        $('.chart-btn').removeClass('active');
        $(this).addClass('active');

        visitChart.data.labels = chartData[period].labels;
        visitChart.data.datasets[0].data = chartData[period].data;
        visitChart.update();
    });
});

// ============================================
// 13. Berita Terkini
// ============================================
$(document).ready(function () {
    // Memberikan efek halus saat memuat komponen berita
    $('.news-horizontal').each(function (i) {
        $(this).css({
            'opacity': '0',
            'transform': 'translateY(20px)'
        });
        setTimeout(() => {
            $(this).animate({ opacity: 1 }, 500).css('transform', 'translateY(0)');
        }, i * 100);
    });
});

// ============================================
// 14. Daftar Berita
// ============================================
'use strict';

(function ($) {
    // Inisialisasi saat dokumen siap
    $(document).ready(function () {
        // Logika untuk hover atau interaksi berita jika diperlukan
        console.log("Berita Terkini dimuat dengan sukses.");
    });

})(jQuery);

// ============================================
// 15. Swiper Pengumuman
// ============================================
$(document).ready(function () {
    if ($('.swiper-pengumuman').length > 0) {
        var swiperPengumuman = new Swiper(".swiper-pengumuman", {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                992: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
        });
    }
});