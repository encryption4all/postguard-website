<div class="grid-container header">
    <h2><span>Send encrypted files and emails</span></h2>
    <p>
        Send & encrypt files, download the PostGuard add-on for your mail
        client, or decrypt PostGuard encrypted mails. Read more.
    </p>
</div>
<div class="grid-container">
    <img src="images/signpost.svg" alt="signpost" usemap="#signpost" />

    <map name="signpost">
        <area
            shape="rect"
            coords="259, 237, 67, 116"
            alt="filesharing"
            href="#filesharing"
        />
        <area
            shape="rect"
            coords="287, 139, 505, 4"
            alt="emailing"
            href="#addons"
        />
    </map>
</div>
<div class="grid-container" />

<style lang="scss">
    .grid-container {
        display: grid;
        grid-auto-columns: 1fr;
        grid-auto-flow: column;
        height: auto;

        &.header {
            display: flex;
            flex-direction: column;
            position: relative;
            height: 100%;
            min-width: 200px;
            max-width: 400px;
            top: 50px;
            text-align: left;
        }
    }
    .grid-container > * {
        overflow: hidden;
    }

    h2 {
        position: relative;
        inline-size: 260px;
        overflow-wrap: break-word;
        margin-bottom: 0;
    }

    p {
        margin-top: 0;
    }

    h2 span {
        background-color: white;
        padding-right: 5px;
    }

    h2:after {
        content: '';
        position: absolute;
        bottom: 12px;
        left: 0;
        right: 0;
        height: 4px;
        background-color: #5fd9ad;
        border-radius: 3.5px;
        z-index: -1;
    }
</style>
