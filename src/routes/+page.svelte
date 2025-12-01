<script>
    import { run } from 'svelte/legacy';

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
    import '$lib/global.scss'
    import {
        Filesharing,
        Home,
        About,
        Addons,
        Fallback,
        PrivacyPolicy,
    } from '$lib/components/slides'

    import { selected } from '$lib/stores'
    import lazySizes from 'lazysizes'

    let initial = $state(true)
    let swiper = $state()

    let params = $state(), uuid = $state(), recipient = $state()

    onMount(() => {
        params = new URLSearchParams(window.location.search)
        uuid = params.get('download')
        recipient = params.get('recipient')
    })

    run(() => {
        if (swiper && swiper.activeIndex !== $selected) swiper.slideTo($selected)
    });
</script>

<Swiper
    modules={[Pagination, HashNavigation, A11y, Mousewheel, Keyboard]}
    pagination={{
        clickable: true,
        el: '.swiper-pagination',
        type: 'bullets',
    }}
    initialSlide={$selected}
    hashNavigation={{ watchState: true }}
    mousewheel={{ forceToAxis: true }}
    keyboard={true}
    on:slideChange={(e) => {
        selected.set(e.detail[0].activeIndex)

        // Remove downloadUuid when sliding away, resetting the filesharing slide.
        if (!initial && $selected !== 0 && uuid) {
            params.delete('download')
            params.delete('recipient')
            const url = (params ? '?' + params : '') + window.location.hash
            window.history.pushState(null, '', url)
            uuid = null
            recipient = null
        }

        if (initial) initial = false
    }}
    on:swiper={(e) => {
        swiper = e.detail[0]
        lazySizes.init()
    }}
    on:touchStart={swiper.setGrabCursor()}
    on:touchEnd={swiper.unsetGrabCursor()}
    noSwipingSelector={'p, li'}
>
    <SwiperSlide data-hash="filesharing"><Filesharing /></SwiperSlide>
    <SwiperSlide><Home /></SwiperSlide>
    <SwiperSlide data-hash="addons"><Addons /></SwiperSlide>
    <SwiperSlide data-hash="fallback"><Fallback /></SwiperSlide>
    <SwiperSlide data-hash="about"><About /></SwiperSlide>
    <SwiperSlide data-hash="privacy"><PrivacyPolicy /></SwiperSlide>
</Swiper>
