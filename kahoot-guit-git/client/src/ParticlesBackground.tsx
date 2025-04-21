import { useEffect, useState, useMemo, memo } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import { ISourceOptions } from "@tsparticles/engine";
import particlesOptions from "./assets/particles.json";

const ParticlesBackground = () => {
    const [init, setInit] = useState(false);

    const memoizedParticlesOptions = useMemo(
        () => particlesOptions as unknown as ISourceOptions,
        []
    );

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    if (!init) return null;

    return (
        <Particles
            id="tsparticles"
            options={memoizedParticlesOptions}
        />
    );
};

export default memo(ParticlesBackground);
