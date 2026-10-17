export function takePermissions(input:any){const{quota:units}=input.rules;return units>5?'ready':'held';}
