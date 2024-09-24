"use client"; 

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const ThreeDModel = () => {
    const containerRef = useRef(); 
    useGSAP(() => {
        gsap.from(containerRef.current, { opacity: 0, duration: 1 });
    }, { scope: containerRef }); 

    useEffect(() => {
        const loadThreeJS = () => {
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 5;

            const scene = new THREE.Scene();
            let gada; 
            let mixer;
            const loader = new GLTFLoader();

            loader.load('/lord_hanuman_gada.glb', (gltf) => {
                gada = gltf.scene; 
                scene.add(gada);
                gada.scale.set(0.60, 0.60, 0.60);
                gada.rotation.x = Math.PI / 2; 

                gada.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true; 
                        node.receiveShadow = true;
                        node.material = new THREE.MeshStandardMaterial({
                            color: 0xffff55, 
                            metalness: 1, 
                            roughness: 0.1 
                        });
                    }
                });

                mixer = new THREE.AnimationMixer(gada);
                if (gltf.animations.length) {
                    mixer.clipAction(gltf.animations[0]).play();
                }
                animateModel();
            }, undefined, (error) => {
                console.error('An error occurred while loading the model:', error);
            });

            const renderer = new THREE.WebGLRenderer({ alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true; 
            containerRef.current.appendChild(renderer.domElement); 
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); 
            scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0xffe84a, 5, 50); 
            pointLight.position.set(0, 0, 5);
            scene.add(pointLight);

            const directionalLight = new THREE.DirectionalLight(0xffe84a, 3); 
            directionalLight.position.set(5, 10, 5); 
            directionalLight.castShadow = true; 
            directionalLight.shadow.mapSize.width = 1024; 
            directionalLight.shadow.mapSize.height = 1024;
            directionalLight.shadow.camera.near = 0.1;
            directionalLight.shadow.camera.far = 50;
            scene.add(directionalLight);

            const bottomGlowLight = new THREE.PointLight(0xffe84a, 3, 50); 
            bottomGlowLight.position.set(0, -1, 0); 
            scene.add(bottomGlowLight);

            const composer = new EffectComposer(renderer);
            const renderPass = new RenderPass(scene, camera);
            composer.addPass(renderPass);

            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.0, 
                0.2,
                0.3  
            );
            composer.addPass(bloomPass);

            bloomPass.strength = 2.0; 
            bloomPass.radius = 0.5; 
            bloomPass.threshold = 0.1; 

            const animateModel = () => {
                requestAnimationFrame(animateModel);

                if (gada) {
                    gada.rotation.y += 0.01;
                }

                if (mixer) mixer.update(0.02);

                composer.render(); 
            };

            const arrPositionModel = [
                { id: 'section1', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
                { id: 'section2', position: { x: 2, y: 0, z: -2 }, rotation: { x: 0, y: Math.PI / 4, z: 0 } },
                { id: 'section3', position: { x: -2, y: 0, z: -2 }, rotation: { x: 0, y: Math.PI / 2, z: 0 } },
            ];

            const modelMove = () => {
                const sections = document.querySelectorAll('.section');
                let currentSection;
                sections.forEach((section) => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= window.innerHeight / 3 && rect.bottom > 0) {
                        currentSection = section.id;
                    }
                });

                const positionActive = arrPositionModel.findIndex(val => val.id === currentSection);
                if (positionActive >= 0) {
                    const newCoordinates = arrPositionModel[positionActive];

                    gsap.to(gada.position, {  
                        x: newCoordinates.position.x,
                        y: newCoordinates.position.y,
                        z: newCoordinates.position.z,
                        duration: 0.6, 
                        ease: "power1.out"
                    });
                    gsap.to(gada.rotation, {  
                        x: newCoordinates.rotation.x,
                        y: newCoordinates.rotation.y,
                        z: newCoordinates.rotation.z,
                        duration: 1,
                        ease: "power1.out"
                    });
                }
            };

            window.addEventListener('scroll', modelMove);
            window.addEventListener('resize', () => {
                renderer.setSize(window.innerWidth, window.innerHeight);
                composer.setSize(window.innerWidth, window.innerHeight);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            });

            return () => {
                window.removeEventListener('scroll', modelMove);
                window.removeEventListener('resize', () => {});
                if (renderer) renderer.dispose();
                if (composer) composer.dispose();
            };
        };

        loadThreeJS();
    }, []);

    return <div ref={containerRef} id="container3D" className="w-full h-full"></div>; 
};

export default ThreeDModel;
