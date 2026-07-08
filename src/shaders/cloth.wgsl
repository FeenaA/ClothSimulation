struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) normal: vec3<f32>,
};

@vertex
fn vs_main(
    @location(0) position: vec2<f32>,
    @location(1) normal: vec3<f32>
) -> VertexOutput {
    var out: VertexOutput;

    out.position = vec4<f32>(position, 0.0, 1.0);
    out.normal = normalize(normal);

    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    //let lightDirection = normalize(vec3<f32>(0.0, 0.0, -1.0));
    let lightDirection = normalize(vec3<f32>(-0.5, 0.8, 0.5));
    let normal = normalize(in.normal);

    let diffuse = max(dot(normal, lightDirection), 0.0);
    let ambient = 0.25;
    let brightness = ambient + diffuse * 0.75;

    let clothColor = vec3<f32>(0.55, 0.55, 0.55);

    return vec4<f32>(clothColor * brightness, 1.0);
}