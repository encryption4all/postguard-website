<script>
    import { Pagination, A11y, HashNavigation } from 'swiper'
    import { Swiper, SwiperSlide } from 'swiper/svelte'
    import 'swiper/css'
    import 'swiper/css/pagination'
    import './../global.scss'

    import Filesharing from './Filesharing.svelte'
    import Home from './Home.svelte'
    import Addons from './Addons.svelte'
    import Fallback from './Fallback.svelte'
    import About from './About.svelte'
    import PrivacyPolicy from './PrivacyPolicy.svelte'

    import Header from './../components/Header.svelte'
    import Footer from './../components/Footer.svelte'

    let selected = 1
    let swiper
    let cryptifySrc = ''

    $: if (swiper && swiper.activeIndex !== selected) swiper.slideTo(selected)
    $: if (swiper) cryptifySrc = 'http://localhost:8080'
</script>

<Header bind:selected />

<Swiper
    modules={[Pagination, HashNavigation, A11y]}
    pagination={{ clickable: true, el: '.swiper-pagination', type: 'bullets' }}
    initialSlide={selected}
    hashNavigation={{ watchState: true }}
    on:slideChange={(e) => {
        selected = e.detail[0].activeIndex
    }}
    on:swiper={(e) => {
        swiper = e.detail[0]
    }}
>
    <SwiperSlide data-hash={'filesharing'}
        ><Filesharing bind:cryptifySrc /></SwiperSlide
    >
    <SwiperSlide><Home /></SwiperSlide>
    <SwiperSlide data-hash={'addons'}><Addons /></SwiperSlide>
    <SwiperSlide data-hash={'fallback'}><Fallback /></SwiperSlide>
    <SwiperSlide data-hash={'about'}><About /></SwiperSlide>
    <SwiperSlide data-hash={'privacy'}><PrivacyPolicy /></SwiperSlide>
</Swiper>

<Footer bind:selected />
