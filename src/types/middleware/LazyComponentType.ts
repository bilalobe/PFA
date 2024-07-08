import React, { ComponentType, LazyExoticComponent } from 'react';

/**
 * A utility type for defining a lazy-loaded React component with TypeScript.
 * It takes a generic type `T` which represents the component's props.
 */
type LazyComponentType<T = {}> = LazyExoticComponent<ComponentType<T>>;

export default LazyComponentType;