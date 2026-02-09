WebOSApps.register("example-app", {
  title: "Example App",
  icon: "⭐",
  showOnDesktop: true,

  render(root, { FileSystem, OS }) {
    root.innerHTML = `
      <h2>Hello from Example App!</h2>
      <p>This proves that WebOSApps.register() works.</p>
      <button id="ex-btn">Click me</button>
      <div id="ex-out" style="margin-top:10px; font-weight:bold;"></div>
    `;

    root.querySelector("#ex-btn").addEventListener("click", () => {
      root.querySelector("#ex-out").textContent = "Button clicked!";
    });
  }
});
