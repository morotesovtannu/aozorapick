<template>
<span v-if="disableLink" v-user-preview="disablePreview ? undefined : user.id" class="eiwwqkts _noSelect" :style="{ color }" :title="acct(user)" @click="onClick">
	<img class="inner" :src="url" decoding="async"/>
	<MkUserOnlineIndicator v-if="showIndicator" class="indicator" :user="user"/>
</span>
<MkA v-else v-user-preview="disablePreview ? undefined : user.id" class="eiwwqkts _noSelect" :style="{ color }" :to="userPage(user)" :title="acct(user)" :target="target">
	<img class="inner" :src="url" decoding="async"/>
	<MkUserOnlineIndicator v-if="showIndicator" class="indicator" :user="user"/>
</MkA>
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import * as misskey from 'misskey-js';
import { getStaticImageUrl } from '@/scripts/get-static-image-url';
import { extractAvgColorFromBlurhash } from '@/scripts/extract-avg-color-from-blurhash';
import { acct, userPage } from '@/filters/user';
import MkUserOnlineIndicator from '@/components/MkUserOnlineIndicator.vue';
import { defaultStore } from '@/store';

const props = withDefaults(defineProps<{
	user: misskey.entities.User;
	target?: string | null;
	disableLink?: boolean;
	disablePreview?: boolean;
	showIndicator?: boolean;
}>(), {
	target: null,
	disableLink: false,
	disablePreview: false,
	showIndicator: false,
});

const emit = defineEmits<{
	(ev: 'click', v: MouseEvent): void;
}>();

const url = $computed(() => defaultStore.state.disableShowingAnimatedImages
	? getStaticImageUrl(props.user.avatarUrl)
	: props.user.avatarUrl);

function onClick(ev: MouseEvent) {
	emit('click', ev);
}

let color = $ref();

watch(() => props.user.avatarBlurhash, () => {
	color = extractAvgColorFromBlurhash(props.user.avatarBlurhash);
}, {
	immediate: true,
});
</script>

<style lang="scss" scoped>
@keyframes earwiggleleft {
	from { transform: rotate(37.6deg) skew(30deg); }
	25% { transform: rotate(10deg) skew(30deg); }
	50% { transform: rotate(20deg) skew(30deg); }
	75% { transform: rotate(0deg) skew(30deg); }
	to { transform: rotate(37.6deg) skew(30deg); }
}

@keyframes earwiggleright {
	from { transform: rotate(-37.6deg) skew(-30deg); }
	30% { transform: rotate(-10deg) skew(-30deg); }
	55% { transform: rotate(-20deg) skew(-30deg); }
	75% { transform: rotate(0deg) skew(-30deg); }
	to { transform: rotate(-37.6deg) skew(-30deg); }
}

.eiwwqkts {
	position: relative;
	display: inline-block;
	vertical-align: bottom;
	flex-shrink: 0;
	// border-radius: 100%;
	line-height: 16px;

	> .inner {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		top: 0;
		border-radius: 28px;
		z-index: 1;
		overflow: hidden;
		object-fit: cover;
		width: 100%;
		height: 100%;
		opacity: .7;
	}

	> .indicator {
		position: absolute;
		z-index: 1;
		bottom: 0;
		left: 0;
		width: 20%;
		height: 20%;
	}
}
</style>
