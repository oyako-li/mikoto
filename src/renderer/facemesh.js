// facemeshの戻り値
var keypoints = prediction.scaledMesh;

var texture = new THREE.CanvasTexture(canvas);
texture.flipY = false;

mesh.geometry.vertices = new Array(keypoints.length);
for (let i = 0; i < keypoints.length; i++) {
    const [x,y,z] = keypoints[i];
    mesh.geometry.vertices[i] = new THREE.Vector3(x,y,z);
}

mesh.geometry.faces = new Array(TRIANGULATION.length / 3);
for (let i = 0; i < TRIANGULATION.length / 3; i++) {

    let id0 = TRIANGULATION[i*3+0];
    let id1 = TRIANGULATION[i*3+1];
    let id2 = TRIANGULATION[i*3+2];
    mesh.geometry.faces[i] = new THREE.Face3(id0,id1,id2);

    // uvはcanvasのサイズに合わせて正規化
    let uv = [
    new THREE.Vector2(keypoints[id0][0] / videoWidth, keypoints[id0][1] / videoHeight),
    new THREE.Vector2(keypoints[id1][0] / videoWidth, keypoints[id1][1] / videoHeight),
    new THREE.Vector2(keypoints[id2][0] / videoWidth, keypoints[id2][1] / videoHeight),
    ];
    mesh.geometry.faceVertexUvs[0][i] = uv;
}
mesh.material = new THREE.MeshBasicMaterial({ map: texture , 
                                                side: THREE.DoubleSide });
