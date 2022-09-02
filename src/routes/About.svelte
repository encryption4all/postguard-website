<div class="grid-container">
    <div class="grid-item">
        <h2>About PostGuard</h2>
        <h3>Why PostGuard</h3>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Varius
            netus mattis in pharetra elementum. Augue dapibus a mauris, et
            ultricies. Quam tempor volutpat sit quam a donec et. Facilisis sed
            lacus tellus sodales integer ultricies venenatis amet tristique.
        </p>
        <h3>How does it work?</h3>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Varius
            netus mattis in pharetra elementum. Augue dapibus a mauris, et
            ultricies. Quam tempor volutpat sit quam a donec et. Facilisis sed
            lacus tellus sodales integer ultricies venenatis amet tristique.
        </p>
    </div>
    <div class="grid-item">
        <img src="images/about.svg" alt="about" />
        <div id="team">
            <h3>About the PostGuard team</h3>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Varius
                netus mattis in pharetra elementum. Augue dapibus a mauris, et
                ultricies. Quam tempor volutpat sit quam a donec et. Facilisis
                sed lacus tellus sodales integer ultricies venenatis amet
                tristique.
            </p>
        </div>
    </div>
</div>

<style lang="scss">
    .grid-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin: auto 5% auto 5%;
        grid-gap: 20%;
    }

    .grid-item {
        max-width: 600px;
        display: flex;
        flex-direction: column;
        text-align: left;
    }

    #team {
        border: 1px dashed #1e1e1e;
        border-radius: 16px;
        margin-top: 80px;
        padding: 40px;
    }

    h2 {
        position: relative;
        display: inline-block;
        z-index: 0;

        &:before {
            content: '';
            position: absolute;
            z-index: -1;
            width: 193px;
            left: 0;
            right: 0;
            bottom: 5px;
            height: 0;
            border: 2px solid rgba(84, 214, 167, 0.5);
            border-radius: 10px;
        }
    }
</style>
