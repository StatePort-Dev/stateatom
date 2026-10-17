<script>import {onMount} from 'svelte';let plan=$state('Loading');onMount(async()=>{plan=(await (await fetch('/api/account')).json()).profile.plan;});</script>
<p id="plan">{plan}</p>
