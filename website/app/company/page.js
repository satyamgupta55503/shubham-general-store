import { redirect } from 'next/navigation';

export default function CompanyRedirectPage() {
  // Jaise hi ye page call hoga, ye automatically redirect kar dega
  redirect('/');
  return null; 
}
