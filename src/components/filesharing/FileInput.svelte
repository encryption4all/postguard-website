<script lang="ts">
    import Lang from '../../../cryptify/cryptify-front-end/src/Lang'

    type CryptFileInputProps = {
        lang: Lang;
        onFile: (f: FileList) => void;
        multiple: boolean;
        required: boolean;
    };
</script>