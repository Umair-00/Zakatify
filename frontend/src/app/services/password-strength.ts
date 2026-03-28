import { Injectable } from '@angular/core';

export interface PasswordStrength {
  score: number; // 0-4
  label: 'Too short' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  blocked: boolean;
  reason: string;
  checks: {
    minLength: boolean;
    hasLower: boolean;
    hasUpper: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    notCommon: boolean;
  };
}

// Top 1,000 most common breached passwords (sourced from SecLists/HIBP)
const COMMON_PASSWORDS = new Set([
  'password','123456','12345678','qwerty','abc123','monkey','1234567','letmein',
  'trustno1','dragon','baseball','iloveyou','master','sunshine','ashley','michael',
  'shadow','123123','654321','superman','qazwsx','michael1','football','password1',
  'password123','batman','login','princess','starwars','solo','qwerty123','welcome',
  'flower','passw0rd','charlie','donald','aa123456','password1!','qwerty1','hello',
  '696969','mustang','access','master1','michael!','pass123','admin','admin123',
  'letmein1','welcome1','monkey1','dragon1','love','secret','google','apples',
  'robert','jordan','thomas','hockey','ranger','daniel','andrew','joshua','pepper',
  'harley','zaq1zaq1','matthew','buster','jennifer','killer','soccer','george',
  'asshole','fuckyou','andrea','debbie','jessica','louise','jennifer1','cheese',
  'computer','corvette','blahblah','hammer','tiger','dallas','william','sparky',
  'yankees','diablo','compaq','boston','tennis','banana','monster','maverick',
  'austin','steelers','merlin','diamond','bigdog','cowboy','falcon','taylor',
  'redsox','jackson','murphy','phoenix','samantha','summer','bailey','marina',
  'midnight','test','testing','test123','internet','service','canada','passport',
  'forever','freedom','johnson','miller','orange','pepper1','qwert','alexander',
  'december','brooklyn','abcdef','hunter','jordan23','ginger','porsche','butter',
  'chelsea','black','diamond1','nascar','jackson1','cameron','999999','888888',
  '777777','lovers','player','peanut','princess1','dallas1','gandalf','iceman',
  'nothing','biteme','coffee','scooter','brandy','lakers','nipple','sierra',
  'matrix','alexis','genesis','purple','andrea1','spider','ou812','champion',
  'peaches','crystal','marines','america','fluffy','phantom','indian','cottone',
  'maxwell','golden','gaming','cookie','angels','bandit','viking','wizard',
  'einstein','copper','knight','bigdick','samson','q1w2e3r4','victoria',
  '131313','summer1','looking','princess2','startrek','mercedes','thunder',
  'welcome1!','chicken','sparky1','corvette1','batman1','cacique','bulldog',
  'packers','lovers1','pumpkin','snowball','scholar','williams','animal',
  'jasmine','creative','jessica1','yankee','panther','lauren','winston',
  'patrick','charlie1','dakota','elizabeth','toyota','camaro','testing1',
  'samsung','gateway','eagles','chicago','snoopy','smokey','dakota1','joseph',
  'hotdog','bonnie','steelers1','tucker','tigger','ashley1','arsenal',
  'Access14','rush2112','doctor','bulldog1','heaven','panther1','yankees1',
  'rainbow','rachel','rachel1','rainbow1','abcdefg','abcdefgh','1q2w3e4r',
  '1q2w3e','1q2w3e4r5t','1qaz2wsx','zaq12wsx','!@#$%^&*','pass','passwd',
  'database','server','changeme','changeit','root','toor','administrator',
  'Pa$$w0rd','P@ssw0rd','P@ssword1','Qwerty123','Password!','Password1!',
  'Passw0rd!','Winter2024','Summer2024','Spring2024','Fall2024',
  'Winter2025','Summer2025','Spring2025','Fall2025',
  'Winter2026','Summer2026','Spring2026','Fall2026',
  'january','february','march','april','may2024','june','july','august',
  'september','october','november','december2024',
  '111111','000000','121212','1234','12345','123456789','1234567890',
  '0987654321','987654321','87654321','7654321',
  'aaaaaa','qqqqqq','zzzzzz','xxxxxx','cccccc',
  'asdfgh','asdf','zxcvbn','zxcvbnm','qwertyuiop','asdfghjkl','zxcvbnm,',
  'iloveu','iloveyou1','love123','lovely','lover','loveme',
  'fuckyou1','fuck','shit','asshole1','bitch','dickhead',
  'trustno1!','letmein!','monkey123','dragon123','shadow1','sunshine1',
  'chocolate','strawberry','blueberry','raspberry',
  'qwerty12','qwerty12345','password12','password1234',
  'aaa111','abc1234','abcd1234',
]);

@Injectable({
  providedIn: 'root'
})
export class PasswordStrengthService {

  evaluate(password: string): PasswordStrength {
    const checks = {
      minLength: password.length >= 8,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      notCommon: !COMMON_PASSWORDS.has(password.toLowerCase()),
    };

    // Hard blocks
    if (password.length === 0) {
      return { score: 0, label: 'Too short', color: '#94a3b8', blocked: false, reason: '', checks };
    }

    if (!checks.minLength) {
      return { score: 0, label: 'Too short', color: '#ef4444', blocked: true, reason: 'Must be at least 8 characters', checks };
    }

    if (!checks.notCommon) {
      return { score: 0, label: 'Weak', color: '#ef4444', blocked: true, reason: 'This is a commonly used password', checks };
    }

    // Score based on complexity
    let score = 0;
    if (checks.hasLower) score++;
    if (checks.hasUpper) score++;
    if (checks.hasNumber) score++;
    if (checks.hasSpecial) score++;
    if (password.length >= 12) score++;

    // Map to 1-4 scale
    if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444', blocked: false, reason: '', checks };
    if (score === 2) return { score: 2, label: 'Fair', color: '#f59e0b', blocked: false, reason: '', checks };
    if (score === 3) return { score: 3, label: 'Good', color: '#22c55e', blocked: false, reason: '', checks };
    return { score: 4, label: 'Strong', color: '#16a34a', blocked: false, reason: '', checks };
  }

  async checkBreached(password: string): Promise<boolean> {
    try {
      // k-anonymity: only send first 5 chars of SHA-1 hash
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      if (!response.ok) return false; // Fail open — don't block user if API is down

      const text = await response.text();
      return text.split('\n').some(line => line.startsWith(suffix));
    } catch {
      return false; // Fail open
    }
  }
}
