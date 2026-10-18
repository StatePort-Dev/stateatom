// SPDX-License-Identifier: Apache-2.0
for (const id of ['default-button', 'primary-button', 'icon-button', 'long-button']) {
  document.getElementById(id).addEventListener('click', () => {
    document.getElementById('action-status').textContent = 'Completed local action: ' + id;
  });
}
for(const selected of ['inputs','evidence'])document.getElementById('example-'+selected).onclick=()=>{
 for(const name of ['inputs','evidence']){
  const button=document.getElementById('example-'+name);
  if(name===selected)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');
  document.getElementById('example-'+name+'-content').hidden=name!==selected;
 }
};
