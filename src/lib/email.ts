import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export const sendInviteEmail = async (email: string, name: string, inviteLink: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'VCS Points <noreply@resend.dev>',
      to: email,
      subject: 'Pakvietimas į VCS Points sistemą',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sveiki, ${name}!</h2>
          <p>Jūs buvote pakviestas prisijungti prie VCS Points sistemos.</p>
          <p>Norėdami pradėti, spauskite žemiau esantį mygtuką:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Prisijungti
            </a>
          </div>
          <p>Jei mygtukas neveikia, galite paspausti šią nuorodą:</p>
          <p><a href="${inviteLink}">${inviteLink}</a></p>
          <p>Šis pakvietimas galioja 24 valandas.</p>
          <p>Su pagarba,<br>VCS Points komanda</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending invite email:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send invite email:', error);
    return { success: false, error };
  }
};

export const sendRedemptionStatusEmail = async (
  email: string,
  name: string,
  prizeName: string,
  status: 'approved' | 'rejected',
  comment?: string
) => {
  const statusText = status === 'approved' ? 'patvirtintas' : 'atmestas';
  const statusColor = status === 'approved' ? '#10B981' : '#EF4444';

  try {
    const { data, error } = await resend.emails.send({
      from: 'VCS Points <noreply@resend.dev>',
      to: email,
      subject: `Jūsų prizo iškeitimo užklausa ${statusText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sveiki, ${name}!</h2>
          <p>Jūsų prizo "${prizeName}" iškeitimo užklausa buvo <span style="color: ${statusColor}">${statusText}</span>.</p>
          ${comment ? `<p>Komentaras: ${comment}</p>` : ''}
          <p>Galite peržiūrėti savo taškų istoriją prisijungę prie sistemos.</p>
          <p>Su pagarba,<br>VCS Points komanda</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending redemption status email:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send redemption status email:', error);
    return { success: false, error };
  }
};

export const sendPointsDeductionEmail = async (
  email: string,
  name: string,
  points: number,
  reason: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'VCS Points <noreply@resend.dev>',
      to: email,
      subject: 'Taškų atėmimas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sveiki, ${name}!</h2>
          <p>Iš jūsų paskyros buvo atimta ${points} taškų.</p>
          <p>Priežastis: ${reason}</p>
          <p>Galite peržiūrėti savo taškų istoriją prisijungę prie sistemos.</p>
          <p>Su pagarba,<br>VCS Points komanda</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending points deduction email:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send points deduction email:', error);
    return { success: false, error };
  }
}; 