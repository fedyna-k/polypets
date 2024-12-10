const parent = document.currentScript.parentElement;
document.currentScript.id = "page-manager";

async function render(link) {
  const view = await fetch(`/view/${link}`);
  if (view.status != 200) {
    return;  
  }
  const html = await view.text();

  createCookie("navigation", link);

  while (parent.lastChild && parent.lastChild.id != "page-manager") {
    parent.lastChild.remove();
  }

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = `/static/style/${link}.css`;
  parent.appendChild(style);

  parent.innerHTML += html;  
}

// render(getCookies().navigation ?? "homepage");
render("homepage");
