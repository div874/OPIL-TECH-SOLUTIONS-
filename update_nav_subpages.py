import os
import re
import glob

base_dir = r'c:\Users\divya\OneDrive\Desktop\1page images\1page\OPIL'
html_files = glob.glob(os.path.join(base_dir, '*.html'))

nav_desktop_replacement = '''<li class="dropdown">
                        <a href="javascript:void(0)" class="nav-link">Services <i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-left: 4px;"></i></a>
                        <ul class="dropdown-menu">
                            <li><a href="marketing.html">Marketing & Lead Gen</a></li>
                            <li><a href="website.html">Website & Funnels</a></li>
                            <li><a href="automation.html">Business Automation</a></li>
                            <li><a href="branding.html">Brand Identity</a></li>
                            <li><a href="social.html">Social Media</a></li>
                        </ul>
                    </li>'''

nav_mobile_replacement = '''<li class="mobile-dropdown">
                <a href="javascript:void(0)" class="mobile-nav-link" onclick="this.nextElementSibling.classList.toggle('show')">Services <i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-left: 4px;"></i></a>
                <ul class="mobile-dropdown-menu">
                    <li><a href="marketing.html" class="mobile-nav-link">Marketing & Lead Gen</a></li>
                    <li><a href="website.html" class="mobile-nav-link">Website & Funnels</a></li>
                    <li><a href="automation.html" class="mobile-nav-link">Business Automation</a></li>
                    <li><a href="branding.html" class="mobile-nav-link">Brand Identity</a></li>
                    <li><a href="social.html" class="mobile-nav-link">Social Media</a></li>
                </ul>
            </li>'''

for file in html_files:
    if 'index.html' in file:
        continue # Already processed index.html

    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace desktop nav
    content = re.sub(
        r'<li>\s*<a href="index\.html#services" class="nav-link">Services</a>\s*</li>',
        nav_desktop_replacement,
        content
    )
    
    # Replace mobile nav
    content = re.sub(
        r'<li>\s*<a href="index\.html#services" class="mobile-nav-link">Services</a>\s*</li>',
        nav_mobile_replacement,
        content
    )
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print(f'Updated navigation in remaining files.')
