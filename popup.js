const input = document.querySelector("input");
const img = document.querySelector("img");
var baseUrl = "https://apis.naver.com/whale/papago/ocr/detect";
var source = "ja";
var target = "ko";

input.addEventListener("input", async function (e) {
  var files = e.target.files;

  for (var i = 0; i < files.length; i++) {
    try {
      await getOcrImage(baseUrl, files[i]);
    } catch (err) {
      console.log(err);
      console.log(files[i].name);
    }
  }
});

async function getOcrImage(url, file) {
  const inputBlob = await fileToBlob(file);

  const formData = jsonToFormData({
    image: inputBlob,
    source,
    target,
  });

  url = await getUrlWithKey(url);
  const rawResponse = await fetch(url, {
    method: "POST",
    body: formData,
  });
  const content = await rawResponse.json();
  console.log(content);

  if(content.renderedImage){
    var outputBase64 = "data:image/;base64," + content.renderedImage;

    displayImage(outputBase64);
    await saveImage("w_" + file.name, outputBase64);
  }
}

async function fileToBlob(file) {
  return new Blob([new Uint8Array(await file.arrayBuffer())], {
    type: file.type,
  });
}

function jsonToFormData(jsonData) {
  var formData = new FormData();
  for (const name in jsonData) {
    formData.append(name, jsonData[name]);
  }
  return formData;
}

function getUrlWithKey(url) {
  return new Promise((resolve) => {
    whale.utility.getHmacURL(url, (urlOutput) => {
      resolve(urlOutput);
    });
  });
}

async function saveImage(filename, base64Data) {
  var blobData = await fetch(base64Data).then((r) => r.blob());
  var a = document.createElement("a");
  var blobUrl = URL.createObjectURL(blobData);
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  }, 0);
}

function displayImage(base64Data) {
  img.src = base64Data;
}
