<script>
    import { onMount } from 'svelte'
    import {
        Pagination,
        A11y,
        HashNavigation,
        Mousewheel,
        Keyboard,
    } from 'swiper'
    import { Swiper, SwiperSlide } from 'swiper/svelte'
    import 'swiper/css'
    import 'swiper/css/pagination'
    import './../global.scss'
    import './../i18n.js'
    import { isLoading } from 'svelte-i18n'
    import Header from './../components/Header.svelte'
    import Footer from './../components/Footer.svelte'

    import {
        Filesharing,
        Home,
        About,
        Addons,
        Fallback,
        PrivacyPolicy,
    } from './../components/slides'

    let initial = true
    let selected = 1
    let swiper
    let cryptifySrc,
        fallbackSrc = ''

    let params, downloadUuid

    onMount(() => {
        params = new URLSearchParams(window.location.search)
        downloadUuid = params.get('download')
    })

    $: if (swiper && swiper.activeIndex !== selected) swiper.slideTo(selected)
    $: if (swiper) {
        cryptifySrc = '/filesharing/'
        fallbackSrc = '/fallback/'
    }
</script>

{#if !$isLoading}
    <Header bind:selected />

    <Swiper
        modules={[Pagination, HashNavigation, A11y, Mousewheel, Keyboard]}
        pagination={{
            clickable: true,
            el: '.swiper-pagination',
            type: 'bullets',
        }}
        initialSlide={selected}
        hashNavigation={{ watchState: true }}
        mousewheel={{ forceToAxis: true }}
        keyboard={true}
        on:slideChange={(e) => {
            selected = e.detail[0].activeIndex

            // Remove downloadUuid when sliding away, resetting the filesharing slide.
            if (!initial && selected !== 0 && downloadUuid) {
                params.delete('download')
                const url = (params ? '?' + params : '') + window.location.hash
                window.history.pushState(null, '', url)
                downloadUuid = null
            }

            if (initial) initial = false
        }}
        on:swiper={(e) => {
            swiper = e.detail[0]
        }}
        on:touchStart={swiper.setGrabCursor()}
        on:touchEnd={swiper.unsetGrabCursor()}
        noSwipingSelector={'p'}
    >
        <SwiperSlide data-hash="filesharing"
            ><Filesharing
                bind:cryptifySrc
                bind:uuid={downloadUuid}
            /></SwiperSlide
        >
        <SwiperSlide><Home /></SwiperSlide>
        <SwiperSlide data-hash="addons"><Addons /></SwiperSlide>
        <SwiperSlide data-hash="fallback"
            ><Fallback bind:fallbackSrc /></SwiperSlide
        >
        <SwiperSlide data-hash="about"><About /></SwiperSlide>
        <SwiperSlide data-hash="privacy"><PrivacyPolicy /></SwiperSlide>
    </Swiper>

    <Footer bind:selected />
{/if}
